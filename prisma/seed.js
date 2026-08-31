const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const demo = await prisma.user.upsert({
    where: { phone: '+243000000000' },
    update: {},
    create: {
      fullName: 'Jean Demo',
      phone: '+243000000000',
      email: 'demo@fasthome.cd',
      passwordHash: 'DEMO_ONLY_CHANGE_ME',
    },
  });

  const existing = await prisma.property.findFirst({ where: { reference: 'FAST-BIEN-000001' } });
  if (!existing) {
    await prisma.property.create({
      data: {
        reference: 'FAST-BIEN-000001',
        title: 'Appartement - Golf Malela',
        type: 'Appartement',
        description: 'Appartement moderne, lumineux et sécurisé.',
        province: 'Haut-Katanga', city: 'Lubumbashi', commune: 'Annexe', neighborhood: 'Golf Malela',
        bedrooms: 2, livingRooms: 1, bathrooms: 2, toilets: 2, parking: true, water: true, electricity: true, security: true,
        ownerRent: 300, fasthomeMargin: 50, tenantRent: 350,
        status: 'PUBLISHED', ownerId: demo.id,
        photos: { create: [{ url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 0 }] },
      },
    });
  }
  console.log('FASTHOME seed terminé. Utilisateur démo:', demo.id);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
