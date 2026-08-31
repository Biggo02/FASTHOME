import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { fail } from '@/lib/api';

export function sessionUserId(request: NextRequest): string | null {
  const session = verifySession(request.cookies.get('fasthome_session')?.value);
  return session?.userId ?? null;
}

export function requireSession(request: NextRequest): string | Response {
  const userId = sessionUserId(request);
  if (!userId) return fail('Session non authentifiée.', 401);
  return userId;
}

export function isAdmin(userId: string): boolean {
  return (process.env.FASTHOME_ADMIN_USER_IDS || '').split(',').map((v) => v.trim()).filter(Boolean).includes(userId);
}

export function requireAdmin(request: NextRequest): string | Response {
  const userId = sessionUserId(request);
  if (!userId) return fail('Session non authentifiée.', 401);
  if (!isAdmin(userId)) return fail('Permission administrateur requise.', 403);
  return userId;
}

export async function canAccessContract(userId: string, contractId: string): Promise<{ allowed: boolean; found: boolean }> {
  const contract = await prisma.contract.findUnique({ where: { id: contractId }, select: { partyId: true, property: { select: { ownerId: true } } } });
  if (!contract) return { allowed: false, found: false };
  return { allowed: contract.partyId === userId || contract.property.ownerId === userId || isAdmin(userId), found: true };
}
