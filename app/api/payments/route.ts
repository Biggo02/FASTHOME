import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredNumber, requiredString } from '@/lib/api';
import { canAccessContract, requireSession } from '@/lib/authorization';

function statusFor(expected: number, paid: number): 'UPCOMING' | 'PAID' | 'PARTIAL' { if (paid <= 0) return 'UPCOMING'; if (paid >= expected) return 'PAID'; return 'PARTIAL'; }

export async function GET(request: NextRequest) {
  try {
    const actorId = requireSession(request); if (typeof actorId !== 'string') return actorId;
    const contractId = new URL(request.url).searchParams.get('contractId');
    if (!contractId) return fail('contractId est obligatoire.', 400);
    const access = await canAccessContract(actorId, contractId);
    if (!access.found) return fail('Contrat introuvable.', 404);
    if (!access.allowed) return fail('Accès aux paiements non autorisé.', 403);
    const payments = await prisma.payment.findMany({ where: { contractId }, orderBy: { dueDate: 'asc' } });
    return ok(payments);
  } catch (error) { console.error(error); return fail('Impossible de récupérer les paiements.', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const actorId = requireSession(request); if (typeof actorId !== 'string') return actorId;
    const body = await request.json();
    const contractId = requiredString(body.contractId, 'contractId');
    const access = await canAccessContract(actorId, contractId);
    if (!access.found) return fail('Contrat introuvable.', 404);
    if (!access.allowed) return fail('Vous n’êtes pas autorisé à enregistrer un paiement sur ce contrat.', 403);
    const expectedAmount = requiredNumber(body.expectedAmount, 'expectedAmount');
    const paidAmount = requiredNumber(body.paidAmount ?? 0, 'paidAmount');
    if (expectedAmount <= 0 || paidAmount < 0 || paidAmount > expectedAmount) return fail('Montants invalides.', 400);
    const payment = await prisma.payment.create({ data: { contractId, dueDate: new Date(requiredString(body.dueDate, 'dueDate')), expectedAmount, paidAmount, paidAt: paidAmount > 0 ? new Date() : null, reference: body.reference?.trim() || null, method: body.method || null, proofUrl: body.proofUrl?.trim() || null, comment: body.comment?.trim() || null, status: statusFor(expectedAmount, paidAmount) } });
    await prisma.auditLog.create({ data: { actorId, action: 'PAYMENT_RECORDED', entity: 'Payment', entityId: payment.id, metadata: { contractId, expectedAmount, paidAmount } } });
    return ok(payment, 201);
  } catch (error) { console.error(error); return fail(error instanceof Error ? error.message : 'Enregistrement du paiement impossible.', 400); }
}
