import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { parseAndImportExcel } from './modules/import/import.service';
import { prisma } from './config/database';

async function run() {
  const filePath = path.resolve(__dirname, '../../וויגו-1.xlsx');
  const buffer = fs.readFileSync(filePath);

  // Use the admin user as the importer
  const adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!adminUser) {
    console.error('Admin user not found. Run seed first.');
    process.exit(1);
  }

  console.log(`Importing from: ${filePath}`);
  const result = await parseAndImportExcel(buffer, adminUser.id);

  console.log(`\n=== Import Result ===`);
  console.log(`Total rows:   ${result.totalRows}`);
  console.log(`Success rows: ${result.successRows}`);
  console.log(`Error rows:   ${result.errorRows}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(e => console.log(`  Row ${e.index}: ${e.error}`));
  }

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
