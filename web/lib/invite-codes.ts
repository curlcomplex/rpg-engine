import { readFile, writeFile } from 'node:fs/promises';
import { CODES_PATH } from './constants';

interface InviteCode {
  used_by: string | null;
  created_at: string;
  claimed_at?: string;
}

interface CodesStore {
  codes: Record<string, InviteCode>;
}

export async function validateInviteCode(code: string): Promise<{ valid: boolean; error?: string }> {
  const store = JSON.parse(await readFile(CODES_PATH, 'utf8')) as CodesStore;
  const entry = store.codes[code];

  if (!entry) return { valid: false, error: 'Invalid invite code.' };
  if (entry.used_by) return { valid: false, error: 'This invite code has already been used.' };

  return { valid: true };
}

export async function claimInviteCode(code: string, userId: string): Promise<void> {
  const store = JSON.parse(await readFile(CODES_PATH, 'utf8')) as CodesStore;
  store.codes[code].used_by = userId;
  store.codes[code].claimed_at = new Date().toISOString();
  await writeFile(CODES_PATH, JSON.stringify(store, null, 2));
}
