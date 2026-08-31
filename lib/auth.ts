import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const secret = () => process.env.SESSION_SECRET || 'dev-only-change-this-secret';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2$120000$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, iterations, salt, expected] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterations || !salt || !expected) return false;
  const actual = pbkdf2Sync(password, salt, Number(iterations), 32, 'sha256');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

export function createSession(userId: string) {
  const payload = Buffer.from(`${userId}.${Date.now()}`).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const decoded = Buffer.from(payload, 'base64url').toString('utf8');
  const [userId, issuedAt] = decoded.split('.');
  if (!userId || !issuedAt || Date.now() - Number(issuedAt) > 1000 * 60 * 60 * 24 * 30) return null;
  return userId;
}
