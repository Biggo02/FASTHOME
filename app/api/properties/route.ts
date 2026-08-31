import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requiredNumber, requiredString } from '@/lib/api';
import { requireSession } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city')?.trim();
    const neighborhood = searchParams.get('neighborhood')?.trim();
    const type = searchParams.get('type')?.trim();
    const maxBudget = searchParams.get('maxBudget');
    const bedrooms = searchParams.get('bedrooms');

    const properties = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        ...(neighborhood ? { neighborhood: { contains: neighborhood.replace(/-/g, ' '), mode: 'insensitive' } } : {}),
        ...(type ? { type: { equals: type, mode: 'insensitive' } } : {}),
        ...(maxBudget ? { tenantRent: { lte: Number(maxBudget) } } : {}),
        ...(bedrooms ? { bedrooms: { gte: Number(bedrooms) } } : {}),
      },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return ok(properties.map((p) => ({ ...p, ownerRent: undefined, fasthomeMargin: undefined, tenantRent: undefined, exactAddress: undefined, latitude: undefined, longitude: undefined })));
  } catch (error) {
    console.error(error);
    return fail('Impossible de récupérer les biens.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSession(request);
    if (typeof auth !== 'string') return auth;
    const ownerId = auth;
    const body = await request.json();
    const title = requiredString(body.title, 'title');
    const type = requiredString(body.type, 'type');
    const description = requiredString(body.description, 'description');
    const province = requiredString(body.province, 'province');
    const city = requiredString(body.city, 'city');
    const commune = requiredString(body.commune, 'commune');
    const neighborhood = requiredString(body.neighborhood, 'neighborhood');
    const ownerRent = requiredNumber(body.ownerRent, 'ownerRent');
    const margin = requiredNumber(body.fasthomeMargin ?? 0, 'fasthomeMargin');

    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || !owner.isActive) return fail('Utilisateur propriétaire introuvable.', 404);

    const count = await prisma.property.count();
    const reference = `FAST-BIEN-${String(count + 1).padStart(6, '0')}`;
    const property = await prisma.property.create({
      data: {
        reference, title, type, description, province, city, commune, neighborhood,
        exactAddress: body.exactAddress || null,
        latitude: body.latitude == null ? null : Number(body.latitude), longitude: body.longitude == null ? null : Number(body.longitude),
        bedrooms: Number(body.bedrooms ?? 0), livingRooms: Number(body.livingRooms ?? 0), bathrooms: Number(body.bathrooms ?? 0), toilets: Number(body.toilets ?? 0), floor: body.floor == null ? null : Number(body.floor),
        parking: Boolean(body.parking), water: Boolean(body.water), electricity: Boolean(body.electricity), security: Boolean(body.security), furnished: Boolean(body.furnished),
        ownerRent, fasthomeMargin: margin, tenantRent: ownerRent + margin, status: 'IN_REVIEW', ownerId,
      },
    });
    await prisma.auditLog.create({ data: { actorId: ownerId, action: 'PROPERTY_SUBMITTED', entity: 'Property', entityId: property.id, metadata: { reference } } });
    return ok(property, 201);
  } catch (error) {
    console.error(error);
    return fail(error instanceof Error ? error.message : 'Création du bien impossible.', 400);
  }
}
