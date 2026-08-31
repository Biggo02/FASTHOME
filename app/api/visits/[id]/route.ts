import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredString } from '@/lib/api';

function adminIds() {
  return (process.env.FASTHOME_ADMIN_USER_IDS || '').split(',').map((v) => v.trim()).filter(Boolean);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actorId = requiredString(body.actorId, 'actorId');
    const action = requiredString(body.action, 'action');
    const visit = await prisma.visit.findUnique({ where: { id }, include: { property: true } });
    if (!visit) return fail('Visite introuvable.', 404);

    const isAdmin = adminIds().includes(actorId);
    const isOwner = visit.property.ownerId === actorId;
    if (action === 'FASTHOME_APPROVE' && !isAdmin) return fail('Permission FASTHOME requise.', 403);
    if (action === 'OWNER_APPROVE' && !isOwner) return fail('Seul le propriétaire peut approuver cette visite.', 403);
    if (!['FASTHOME_APPROVE', 'OWNER_APPROVE', 'DECLINE', 'COMPLETE'].includes(action)) return fail('Action invalide.', 400);

    let data: Record<string, unknown> = {};
    if (action === 'FASTHOME_APPROVE') data = { fastHomeApproved: true };
    if (action === 'OWNER_APPROVE') data = { ownerApproved: true };
    if (action === 'DECLINE') data = { status: 'DECLINED' };
    if (action === 'COMPLETE') data = { status: 'COMPLETED' };

    const nextFast = action === 'FASTHOME_APPROVE' ? true : visit.fastHomeApproved;
    const nextOwner = action === 'OWNER_APPROVE' ? true : visit.ownerApproved;
    if (action !== 'DECLINE' && action !== 'COMPLETE' && nextFast && nextOwner) {
      data.status = 'CONFIRMED';
    }
    if (action === 'COMPLETE') {
      await prisma.property.update({ where: { id: visit.propertyId }, data: { status: 'VISIT_COMPLETED' } });
    } else if (nextFast && nextOwner) {
      await prisma.property.update({ where: { id: visit.propertyId }, data: { status: 'VISIT_SCHEDULED' } });
    }

    const updated = await prisma.visit.update({ where: { id }, data: data as any });
    await prisma.auditLog.create({ data: { actorId, action: `VISIT_${action}`, entity: 'Visit', entityId: id, metadata: { propertyId: visit.propertyId } } });
    return ok(updated);
  } catch (error) {
    console.error(error);
    return fail(error instanceof Error ? error.message : 'Mise à jour impossible.', 400);
  }
}
