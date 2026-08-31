import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get('token');
    if (!token) return fail('Token de vérification manquant.', 400);
    const contract = await prisma.contract.findUnique({ where: { qrToken: token }, select: { reference: true, status: true, createdAt: true, startDate: true, endDate: true, property: { select: { reference: true, title: true, city: true, commune: true, neighborhood: true } } } });
    if (!contract) return fail('Contrat introuvable ou QR invalide.', 404);
    return ok({ valid: ['AWAITING_SIGNATURES', 'DOCUMENTS_UPLOADED', 'ACTIVE'].includes(contract.status), reference: contract.reference, property: contract.property, status: contract.status, createdAt: contract.createdAt, startDate: contract.startDate, endDate: contract.endDate });
  } catch (error) {
    console.error(error);
    return fail('Vérification impossible.', 500);
  }
}
