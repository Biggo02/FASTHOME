import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { fail, ok } from '@/lib/api';

export async function GET(request: NextRequest) {
  const session = verifySession(request.cookies.get('fasthome_session')?.value);
  if (!session) return fail('Session non authentifiée.', 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    return fail('Compte introuvable ou désactivé.', 401);
  }

  return ok(user);
}
