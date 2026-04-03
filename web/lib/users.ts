import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { USERS_DIR } from './constants';

export interface UserProfile {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const entries = await readdir(USERS_DIR).catch(() => []);
  for (const userId of entries) {
    try {
      const profile = JSON.parse(
        await readFile(join(USERS_DIR, userId, 'profile.json'), 'utf8')
      ) as UserProfile;
      if (profile.username === username) return profile;
    } catch {
      continue;
    }
  }
  return null;
}

export async function createUser(profile: UserProfile): Promise<void> {
  const userDir = join(USERS_DIR, profile.id);
  await mkdir(join(userDir, 'worlds'), { recursive: true });
  await writeFile(join(userDir, 'profile.json'), JSON.stringify(profile, null, 2));
}
