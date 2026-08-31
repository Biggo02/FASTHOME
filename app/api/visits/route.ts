import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredString } from '@/lib/api';
import { isAdmin, requireSession } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  try {
    const userId = requireSession(request);
    if (typeof userId !== 'string') return userId;
    const requestedRequester = new URL(request.url).searchParams.get('requesterId');
    const requestedAgent = new URL(request.url).searchParams.get('agentId');
    const requestedProperty = new URL(request.url).searchParams.get('propertyId');
    if ((requestedRequester && requestedRequester !== userId) || (requestedAgent && requestedAgent !== userId)) {
      return fail('Accès aux visites non autorisé.', 403);
    }

    const where = isAdmin(userId)
      ? { ...(requestedRequester ? { requesterId: requestedRequester } : {}), ...(requestedAgent ? { agentId: requestedAgent } : {}), ...(requestedProperty ? { propertyId: requestedProperty } : {}) }
      : { ...(requestedRequester ? { requesterId: requestedRequester } : { requesterId: userId }), ...(requestedAgent ? { agentId: requestedAgent } : {}), ...(requestedProperty ? { propertyId: requestedProperty } : {}) };

    const visits = await prisma.visit.findMany({
      where: isAdmin(userId) ? where : { OR: [where, { property: { ownerId: userId }, ...(requestedProperty ? { propertyId: requestedProperty } : {}) }] },
      include: { property: { include: { photos: { where: { isPrimary: true } } } }, requester: { select: { id: true, fullName: true } }, agent: { select: { id: true, fullName: true } } },
      orderBy: { preferredDate: 'asc' },
    });
    return ok(visits);
  } catch (error) {
    console.error(error);
    return fail('Impossible de récupérer les visites.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const requesterId = requireSession(request);
    if (typeof requesterId !== 'string') return requesterId;
    const body = await request.json();
    const propertyId = requiredString(body.propertyId, 'propertyId');
    const date = requiredString(body.preferredDate, 'preferredDate');
    const preferredTime = requiredString(body.preferredTime, 'preferredTime');

    const property = await prisma.property.findFirst({ where: { id: propertyId, status: { in: ['PUBLISHED', 'VISIT_REQUESTED', 'VISIT_SCHEDULED'] } } });
    if (!property) return fail('Ce bien n’est plus disponible pour une visite.', 409);

    const visit = await prisma.visit.create({ data: { propertyId, requesterId, preferredDate: new Date(date), preferredTime, notes: body.notes?.trim() || null, status: 'PENDING' } });
    await prisma.property.update({ where: { id: propertyId }, data: { status: 'VISIT_REQUESTED' } });
    await prisma.auditLog.create({ data: { actorId: requesterId, action: 'VISIT_REQUESTED', entity: 'Visit', entityId: visit.id, metadata: { propertyId } } });
    return ok(visit, 201);
  } catch (error) {
    console.error(error);
    return fail(error instanceof Error ? error.message : 'Demande de visite impossible.', 400);
  }
}
