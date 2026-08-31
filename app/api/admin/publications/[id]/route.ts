import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/authorization';

const transitions = { validate: 'VALIDATED', publish: 'PUBLISHED', reject: 'REJECTED', request_changes: 'IN_REVIEW' } as const;
type Action = keyof typeof transitions;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin(request);
    if (typeof adminId !== 'string') return adminId;
    const { id } = await params;
    const body = await request.json();
    const action = body.action as Action;
    if (!action || !(action in transitions)) return fail('Action administrative invalide.', 400);
    if (action === 'reject' && !String(body.reason || '').trim()) return fail('Le motif du refus est obligatoire.', 400);

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return fail('Publication introuvable.', 404);
    if (action === 'publish' && property.status !== 'VALIDATED' && property.status !== 'TO_PUBLISH') return fail('Un bien doit être validé avant publication.', 409);
    if (action === 'validate' && property.status !== 'IN_REVIEW') return fail('Cette publication ne peut pas être validée dans son état actuel.', 409);

    const updated = await prisma.property.update({ where: { id }, data: { status: transitions[action] } });
    await prisma.auditLog.create({ data: { actorId: adminId, action: `PUBLICATION_${action.toUpperCase()}`, entity: 'Property', entityId: id, metadata: { from: property.status, to: updated.status, reason: body.reason || null } } });
    return ok(updated);
  } catch (error) { console.error(error); return fail('Transition de publication impossible.', 400); }
}
