import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredString } from '@/lib/api';
import { isAdmin, requireSession } from '@/lib/authorization';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actorId = requireSession(request);
    if (typeof actorId !== 'string') return actorId;
    const { id } = await params;
    const body = await request.json();
    const action = requiredString(body.action, 'action');
    const visit = await prisma.visit.findUnique({ where: { id }, include: { property: true } });
    if (!visit) return fail('Visite introuvable.', 404);

    const admin = isAdmin(actorId);
    const isOwner = visit.property.ownerId === actorId;
    const isRequester = visit.requesterId === actorId;
    if (action === 'FASTHOME_APPROVE' && !admin) return fail('Permission FASTHOME requise.', 403);
    if (action === 'OWNER_APPROVE' && !isOwner) return fail('Seul le propriétaire peut approuver cette visite.', 403);
    if (action === 'COMPLETE' && !admin && !isOwner && !isRequester) return fail('Vous n’êtes pas autorisé à terminer cette visite.', 403);
    if (action === 'DECLINE' && !admin && !isOwner && !isRequester) return fail('Vous n’êtes pas autorisé à refuser cette visite.', 403);
    if (!['FASTHOME_APPROVE', 'OWNER_APPROVE', 'DECLINE', 'COMPLETE'].includes(action)) return fail('Action invalide.', 400);

    let data: Record<string, unknown> = {};
    if (action === 'FASTHOME_APPROVE') data = { fastHomeApproved: true };
    if (action === 'OWNER_APPROVE') data = { ownerApproved: true };
    if (action === 'DECLINE') data = { status: 'DECLINED' };
    if (action === 'COMPLETE') data = { status: 'COMPLETED' };

    const nextFast = action === 'FASTHOME_APPROVE' ? true : visit.fastHomeApproved;
    const nextOwner = action === 'OWNER_APPROVE' ? true : visit.ownerApproved;
    if (action !== 'DECLINE' && action !== 'COMPLETE' && nextFast && nextOwner) data.status = 'CONFIRMED';
    if (action === 'COMPLETE') await prisma.property.update({ where: { id: visit.propertyId }, data: { status: 'VISIT_COMPLETED' } });
    else if (nextFast && nextOwner) await prisma.property.update({ where: { id: visit.propertyId }, data: { status: 'VISIT_SCHEDULED' } });

    const updated = await prisma.visit.update({ where: { id }, data: data as any });
    await prisma.auditLog.create({ data: { actorId, action: `VISIT_${action}`, entity: 'Visit', entityId: id, metadata: { propertyId: visit.propertyId } } });
    return ok(updated);
  } catch (error) {
    console.error(error);
    return fail(error instanceof Error ? error.message : 'Mise à jour impossible.', 400);
  }
}
