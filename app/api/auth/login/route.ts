import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, verifyPassword } from '@/lib/auth';
import { fail, ok, requiredString } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = requiredString(body.identifier, 'Email ou téléphone');
    const password = requiredString(body.password, 'Mot de passe');
    const user = await prisma.user.findFirst({ where: { OR: [{ phone: identifier }, { email: identifier.toLowerCase() }], isActive: true } });
    if (!user || !verifyPassword(password, user.passwordHash)) return fail('Identifiants incorrects.', 401);

    const response = ok({ id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl });
    response.cookies.set('fasthome_session', createSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    console.error(error);
    return fail('Connexion impossible.', 400);
  }
}
