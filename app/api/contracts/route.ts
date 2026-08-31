import { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredString } from '@/lib/api';
import { isAdmin, requireSession } from '@/lib/authorization';

function contractReference(year: number, sequence: number) { return `FAST-CTR-${year}-${String(sequence).padStart(6, '0')}`; }
async function nextReference(year: number, offset = 0) {
  const count = await prisma.contract.count({ where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`), lt: new Date(`${year + 1}-01-01T00:00:00.000Z`) } } });
  return contractReference(year, count + 1 + offset);
}

export async function GET(request: NextRequest) {
  try {
    const partyId = requireSession(request);
    if (typeof partyId !== 'string') return partyId;
    const requestedParty = new URL(request.url).searchParams.get('partyId');
    if (requestedParty && requestedParty !== partyId) return fail('Accès aux contrats non autorisé.', 403);
    const contracts = await prisma.contract.findMany({ where: isAdmin(partyId) && requestedParty ? { partyId: requestedParty } : { partyId }, include: { property: { select: { reference: true, title: true, city: true, commune: true, neighborhood: true } }, payments: true }, orderBy: { createdAt: 'desc' } });
    return ok(contracts);
  } catch (error) { console.error(error); return fail('Impossible de récupérer les contrats.', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const actorId = requireSession(request);
    if (typeof actorId !== 'string') return actorId;
    const body = await request.json();
    const visitId = requiredString(body.visitId, 'visitId');
    const visit = await prisma.visit.findUnique({ where: { id: visitId }, include: { property: true } });
    if (!visit) return fail('Visite introuvable.', 404);
    if (visit.status !== 'COMPLETED') return fail('La visite doit être terminée avant de lancer la location.', 409);
    if (visit.requesterId !== actorId) return fail('Seul le demandeur peut accepter le bien.', 403);

    const existing = await prisma.contract.findMany({ where: { propertyId: visit.propertyId, status: { notIn: ['TERMINATED', 'EXPIRED'] } } });
    if (existing.length) return fail('Une location est déjà en cours pour ce bien.', 409);
    const year = new Date().getFullYear();
    const startDate = new Date(body.startDate || Date.now());
    const endDate = new Date(body.endDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000));
    const tenantReference = await nextReference(year);
    const ownerReference = await nextReference(year, 1);
    const tenant = await prisma.contract.create({ data: { reference: tenantReference, propertyId: visit.propertyId, partyId: visit.requesterId, role: 'TENANT', status: 'AWAITING_SIGNATURES', startDate, endDate, amount: visit.property.tenantRent, qrToken: randomBytes(24).toString('hex') } });
    const owner = await prisma.contract.create({ data: { reference: ownerReference, propertyId: visit.propertyId, partyId: visit.property.ownerId, role: 'OWNER', status: 'AWAITING_SIGNATURES', startDate, endDate, amount: visit.property.ownerRent, qrToken: randomBytes(24).toString('hex') } });
    await prisma.property.update({ where: { id: visit.propertyId }, data: { status: 'RENTAL_IN_PROGRESS' } });
    await prisma.auditLog.create({ data: { actorId, action: 'RENTAL_STARTED', entity: 'Property', entityId: visit.propertyId, metadata: { visitId, tenantContract: tenant.reference, ownerContract: owner.reference } } });
    return ok({ tenantContract: tenant, ownerContract: owner }, 201);
  } catch (error) { console.error(error); return fail(error instanceof Error ? error.message : 'Création des contrats impossible.', 400); }
}
