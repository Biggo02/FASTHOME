import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword } from '@/lib/auth';
import { fail, ok, requiredString } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = requiredString(body.fullName, 'Nom complet');
    const phone = requiredString(body.phone, 'Téléphone');
    const password = requiredString(body.password, 'Mot de passe');
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null;
    if (password.length < 8) return fail('Le mot de passe doit contenir au moins 8 caractères.');

    const duplicate = await prisma.user.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] } });
    if (duplicate) return fail('Un compte existe déjà avec ce téléphone ou cet email.', 409);

    const user = await prisma.user.create({ data: { fullName, phone, email, passwordHash: hashPassword(password) } });
    const response = ok({ id: user.id, fullName: user.fullName, email: user.email, phone: user.phone }, 201);
    response.cookies.set('fasthome_session', createSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    console.error(error);
    return fail('Création du compte impossible.', 400);
  }
}
