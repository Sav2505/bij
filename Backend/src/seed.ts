import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './config/database';
import { hashPassword } from './utils/password.util';

async function seed() {
  console.log('Seeding database...');

  const adminPassword = await hashPassword('Admin1234!');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      email: 'admin@viggo.co.il',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
    update: {},
  });

  console.log(`Admin user ready: ${admin.username} / Admin1234!`);

  const demoPassword = await hashPassword('User1234!');
  const demo = await prisma.user.upsert({
    where: { username: 'demo' },
    create: {
      username: 'demo',
      email: 'demo@viggo.co.il',
      passwordHash: demoPassword,
      role: 'USER',
    },
    update: {},
  });

  console.log(`Demo user ready: ${demo.username} / User1234!`);
  console.log('Done.');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
