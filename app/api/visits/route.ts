import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredString } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');
    const agentId = searchParams.get('agentId');
    const visits = await prisma.visit.findMany({
      where: {
        ...(requesterId ? { requesterId } : {}),
        ...(agentId ? { agentId } : {}),
      },
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
    const body = await request.json();
    const propertyId = requiredString(body.propertyId, 'propertyId');
    const requesterId = requiredString(body.requesterId, 'requesterId');
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
