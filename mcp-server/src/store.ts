import { promises as fs } from 'node:fs';
import { nanoid } from 'nanoid';
import type { WorldDocument, GameNode, GameEdge, NodeType, EdgeType } from './types.js';
import { VERSION } from './types.js';

export class WorldStore {
  private filePath: string;
  private lockQueue: Promise<void> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /** Acquire exclusive access for a read-modify-write cycle. */
  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const next = new Promise<void>(resolve => { release = resolve; });
    const prev = this.lockQueue;
    this.lockQueue = next;
    await prev;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  // --- Disk I/O ---

  async read(): Promise<WorldDocument> {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as WorldDocument;
  }

  async write(doc: WorldDocument): Promise<void> {
    try {
      const current = await this.read();
      if (doc.nodes.length < current.nodes.length) {
        const lost = current.nodes.length - doc.nodes.length;
        throw new Error(
          `WRITE BLOCKED: would drop ${lost} nodes ` +
          `(disk has ${current.nodes.length}, writing ${doc.nodes.length}). ` +
          `Stale read detected. Aborting to protect data.`
        );
      }
    } catch (e: any) {
      if (e.message?.startsWith('WRITE BLOCKED')) throw e;
    }

    doc.exported_at = new Date().toISOString();
    doc.source.tool_version = VERSION;
    const json = JSON.stringify(doc, null, 2);
    const tmpPath = this.filePath + '.tmp';
    await fs.writeFile(tmpPath, json, 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }

  async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      const doc: WorldDocument = {
        rpg_engine_version: VERSION,
        created_at: new Date().toISOString(),
        exported_at: new Date().toISOString(),
        source: { tool: 'rpg-engine-mcp', tool_version: VERSION },
        world: { id: `w_${nanoid(16)}`, title: 'New World' },
        player: { character_id: '', session_count: 0, current_act: 1, current_beat: 'opening' },
        nodes: [],
        edges: [],
      };
      await this.write(doc);
    }
  }

  // --- ID generation ---

  nodeId(): string { return `n_${nanoid(16)}`; }
  edgeId(): string { return `e_${nanoid(16)}`; }

  // --- Node operations ---

  async addNode(node: GameNode): Promise<GameNode> {
    return this.withLock(async () => {
      const doc = await this.read();
      doc.nodes.push(node);
      await this.write(doc);
      return node;
    });
  }

  async getNode(id: string): Promise<{ node: GameNode; edges: GameEdge[] } | undefined> {
    const doc = await this.read();
    const node = doc.nodes.find(n => n.id === id);
    if (!node) return undefined;
    const edges = doc.edges.filter(e => e.source === id || e.target === id);
    return { node, edges };
  }

  async updateNode(
    id: string,
    patch: Partial<Pick<GameNode, 'title' | 'description' | 'tags' | 'status' | 'properties'>>,
  ): Promise<GameNode | undefined> {
    return this.withLock(async () => {
      const doc = await this.read();
      const node = doc.nodes.find(n => n.id === id);
      if (!node) return undefined;

      if (patch.title !== undefined) node.title = patch.title;
      if (patch.description !== undefined) node.description = patch.description;
      if (patch.tags !== undefined) node.tags = patch.tags;
      if (patch.status !== undefined) node.status = patch.status;
      if (patch.properties !== undefined) {
        node.properties = { ...node.properties, ...patch.properties };
      }
      node.updated_at = new Date().toISOString();

      await this.write(doc);
      return node;
    });
  }

  async removeNode(id: string): Promise<{ node: GameNode; removedEdgeIds: string[] } | undefined> {
    return this.withLock(async () => {
      const doc = await this.read();
      const nodeIdx = doc.nodes.findIndex(n => n.id === id);
      if (nodeIdx === -1) return undefined;

      const node = doc.nodes[nodeIdx];
      const removedEdgeIds = doc.edges.filter(e => e.source === id || e.target === id).map(e => e.id);

      doc.nodes.splice(nodeIdx, 1);
      doc.edges = doc.edges.filter(e => e.source !== id && e.target !== id);

      // Bypass node count safety check for intentional deletes
      doc.exported_at = new Date().toISOString();
      doc.source.tool_version = VERSION;
      const json = JSON.stringify(doc, null, 2);
      const tmpPath = this.filePath + '.tmp';
      await fs.writeFile(tmpPath, json, 'utf-8');
      await fs.rename(tmpPath, this.filePath);

      return { node, removedEdgeIds };
    });
  }

  // --- Edge operations ---

  async addEdge(edge: GameEdge): Promise<GameEdge> {
    return this.withLock(async () => {
      const doc = await this.read();
      if (!doc.nodes.find(n => n.id === edge.source)) throw new Error(`Source node ${edge.source} not found`);
      if (!doc.nodes.find(n => n.id === edge.target)) throw new Error(`Target node ${edge.target} not found`);
      doc.edges.push(edge);
      await this.write(doc);
      return edge;
    });
  }

  async removeEdge(id: string): Promise<GameEdge | undefined> {
    return this.withLock(async () => {
      const doc = await this.read();
      const idx = doc.edges.findIndex(e => e.id === id);
      if (idx === -1) return undefined;
      const edge = doc.edges[idx];
      doc.edges.splice(idx, 1);
      await this.write(doc);
      return edge;
    });
  }

  // --- Read-only query helpers ---

  async getDocument(): Promise<WorldDocument> {
    return this.read();
  }

  async getNodesByType(type: NodeType): Promise<GameNode[]> {
    const doc = await this.read();
    return doc.nodes.filter(n => n.type === type);
  }

  async getEdgesForNode(nodeId: string): Promise<GameEdge[]> {
    const doc = await this.read();
    return doc.edges.filter(e => e.source === nodeId || e.target === nodeId);
  }

  static findNode(doc: WorldDocument, id: string): GameNode | undefined {
    return doc.nodes.find(n => n.id === id);
  }
}
