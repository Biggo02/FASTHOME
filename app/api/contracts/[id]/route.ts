import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredString } from '@/lib/api';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actorId = requiredString(body.actorId, 'actorId');
    const contract = await prisma.contract.findUnique({ where: { id }, include: { property: true } });
    if (!contract) return fail('Contrat introuvable.', 404);

    if (body.action === 'UPLOAD_SIGNED_DOCUMENT') {
      const documentUrl = requiredString(body.documentUrl, 'documentUrl');
      const updated = await prisma.contract.update({ where: { id }, data: { signedDocumentUrl: documentUrl, status: 'DOCUMENTS_UPLOADED' } });
      const siblings = await prisma.contract.findMany({ where: { propertyId: contract.propertyId } });
      const bothSigned = siblings.some((c) => c.id !== id && c.role !== contract.role && !!c.signedDocumentUrl && ['DOCUMENTS_UPLOADED', 'ACTIVE'].includes(c.status));
      if (bothSigned) {
        await prisma.contract.updateMany({ where: { propertyId: contract.propertyId, status: 'DOCUMENTS_UPLOADED' }, data: { status: 'ACTIVE' } });
        await prisma.property.update({ where: { id: contract.propertyId }, data: { status: 'RENTED' } });
      }
      await prisma.auditLog.create({ data: { actorId, action: 'SIGNED_CONTRACT_UPLOADED', entity: 'Contract', entityId: id, metadata: { propertyId: contract.propertyId } } });
      return ok(updated);
    }

    if (body.action === 'TERMINATE') {
      const updated = await prisma.contract.update({ where: { id }, data: { status: 'TERMINATED' } });
      await prisma.auditLog.create({ data: { actorId, action: 'CONTRACT_TERMINATED', entity: 'Contract', entityId: id } });
      return ok(updated);
    }
    return fail('Action invalide.', 400);
  } catch (error) {
    console.error(error);
    return fail(error instanceof Error ? error.message : 'Mise à jour du contrat impossible.', 400);
  }
}
