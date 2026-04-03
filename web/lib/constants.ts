import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
export const USERS_DIR = path.join(DATA_DIR, 'users');
export const CODES_PATH = path.join(DATA_DIR, 'invite-codes.json');
