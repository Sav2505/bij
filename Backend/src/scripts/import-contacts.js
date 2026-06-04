/* eslint-disable */
require('dotenv').config();
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const norm = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  return String(v).trim() || undefined;
};

const normNum = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : Math.round(n);
};

// Contact-sheet hotel name → DB hotel name
// '__SKIP__'     = not in DB, ignore
// '__NETWORK__'  = network-level row (no specific hotel)
const NAME_MAP = {
  'אטלס ':     '__NETWORK__',
  'אטלס':      '__NETWORK__',
  'סינמה':     'סינימה',
  "בקסטייג'":  "בקסטג'",
  'פבריק':     'פאבריק',
  'שלום & רילקס': 'שלום',
  'סנטר שיק':  '__SKIP__',
};

function parseContactsSheet(wb) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['אנשי קשר'], { header: 1, defval: '' });
  const hotels = [];
  let current = null;

  // Row 0-2 are headers; data starts at row 3
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    const hotelName = norm(row[0]);

    if (hotelName) {
      current = {
        sheetName: hotelName,
        remarks:   norm(row[1]),
        roomCount: normNum(row[4]),
        contacts:  [],
      };
      hotels.push(current);
    }

    if (current === null) continue;

    // MANAGEMENT — col 8 = name, col 9 = role, col 10 = phone, col 11 = email
    // col 7 = area manager (fallback if col 8 is empty)
    const areaManager = norm(row[7]);
    const mgmtName    = norm(row[8]);
    const mgmtRole    = norm(row[9]);
    const mgmtPhone   = norm(row[10]);
    const mgmtEmail   = norm(row[11]);

    if (mgmtName) {
      current.contacts.push({ category: 'MANAGEMENT', name: mgmtName, role: mgmtRole, phone: mgmtPhone, email: mgmtEmail });
    } else if (areaManager) {
      current.contacts.push({ category: 'MANAGEMENT', name: areaManager, role: 'מנהל אזורי', phone: mgmtPhone, email: mgmtEmail });
    }

    // IT — col 12-15
    const itName = norm(row[12]);
    if (itName) {
      current.contacts.push({ category: 'IT', name: itName, role: norm(row[13]), phone: norm(row[14]), email: norm(row[15]) });
    }

    // MAINTENANCE — col 16-19
    const maintName = norm(row[16]);
    if (maintName) {
      current.contacts.push({ category: 'MAINTENANCE', name: maintName, role: norm(row[17]), phone: norm(row[18]), email: norm(row[19]) });
    }
  }

  return hotels;
}

async function run() {
  const wb = XLSX.readFile('C:/Users/IT-Admin/OneDrive/שולחן העבודה/Projects/Bij/וויגו-1.xlsx');
  const sheetHotels = parseContactsSheet(wb);

  // Load all DB hotels
  const dbHotels = await prisma.hotel.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true, network: { select: { name: true } } },
  });

  const dbMap = {};
  dbHotels.forEach((h) => { dbMap[h.name] = h.id; });

  let imported = 0;
  let skipped  = 0;

  for (const h of sheetHotels) {
    const mapped = NAME_MAP[h.sheetName];

    if (mapped === '__SKIP__') {
      console.log('SKIP (not in DB):', h.sheetName);
      skipped++;
      continue;
    }
    if (mapped === '__NETWORK__') {
      console.log('SKIP (network-level row):', h.sheetName);
      skipped++;
      continue;
    }

    const dbName  = mapped || h.sheetName;
    const hotelId = dbMap[dbName];

    if (hotelId === undefined) {
      console.log('NOT FOUND:', h.sheetName, '->', dbName);
      skipped++;
      continue;
    }

    // Update hotel fields if present in sheet
    const updateData = {};
    if (h.roomCount !== undefined) updateData.roomCount = h.roomCount;
    if (h.remarks   !== undefined) updateData.remarks   = h.remarks;
    if (Object.keys(updateData).length > 0) {
      await prisma.hotel.update({ where: { id: hotelId }, data: updateData });
    }

    // Replace contacts
    if (h.contacts.length > 0) {
      await prisma.contact.deleteMany({ where: { hotelId } });
      await prisma.contact.createMany({
        data: h.contacts.map((c) => ({ ...c, hotelId })),
      });
    }

    console.log('OK:', dbName.padEnd(20), '| contacts:', h.contacts.length, '| roomCount:', h.roomCount ?? '-', h.remarks ? '| remarks: ' + h.remarks.slice(0, 40) : '');
    imported++;
  }

  console.log('\n--- Done ---');
  console.log('Imported:', imported, '| Skipped:', skipped);
  await prisma.$disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
