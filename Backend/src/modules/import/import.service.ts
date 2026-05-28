import * as XLSX from 'xlsx';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

interface ExcelRow {
  index: number;
  rawRow: unknown[];
  error?: string;
}

interface ImportResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: ExcelRow[];
}

const normalizeStr = (v: unknown): string | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  return String(v).trim() || undefined;
};

const normalizeNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : Math.round(n);
};

export const parseAndImportExcel = async (buffer: Buffer, userId: string): Promise<ImportResult> => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // ---- Sheet 1: VIGGO ----
  const viggoSheet = workbook.Sheets['VIGGO'];
  // ---- Sheet 2: HOT licenses ----
  const hotSheet = workbook.Sheets['כמות רישוי להוט'];
  // ---- Sheet 3: Contacts ----
  const contactsSheet = workbook.Sheets['אנשי קשר'];

  const viggoRows: unknown[][] = XLSX.utils.sheet_to_json(viggoSheet, { header: 1, defval: '' });
  const hotRows: unknown[][] = XLSX.utils.sheet_to_json(hotSheet, { header: 1, defval: '' });
  const contactsRows: unknown[][] = XLSX.utils.sheet_to_json(contactsSheet, { header: 1, defval: '' });

  // Build HOT license lookup: { networkName_hotelName: { count, notes } }
  const hotMap = new Map<string, { count?: number; notes?: string }>();
  for (let i = 1; i < hotRows.length; i++) {
    const row = hotRows[i];
    const network = normalizeStr(row[0]);
    const hotel = normalizeStr(row[1]);
    if (!network || !hotel) continue;
    const key = `${network.toLowerCase()}|${hotel.toLowerCase()}`;
    hotMap.set(key, { count: normalizeNum(row[2]), notes: normalizeStr(row[3]) });
  }

  // Build Contacts lookup: { networkName_hotelName: contacts[] }
  // Contacts sheet columns (0-indexed after header rows):
  // 0: hotel network, 1: remarks, 2: procurement, 3: room count, 4: mgmt count
  // Management: 5=name, 6=role(skip merged), 7=phone, 8=email... 
  // The sheet has merged headers, so we parse best-effort
  const contactsMap = new Map<string, Array<{ category: string; name?: string; role?: string; phone?: string; email?: string }>>();
  // Row 0 is category header, Row 1 is sub-header, data starts Row 2
  for (let i = 2; i < contactsRows.length; i++) {
    const row = contactsRows[i];
    const networkName = normalizeStr(row[0]);
    if (!networkName) continue;

    const contacts: Array<{ category: string; name?: string; role?: string; phone?: string; email?: string }> = [];

    // Management cols ~7-10 (name, role, phone, email)
    if (normalizeStr(row[7])) contacts.push({ category: 'MANAGEMENT', name: normalizeStr(row[7]), role: normalizeStr(row[8]), phone: normalizeStr(row[9]), email: normalizeStr(row[10]) });
    // IT cols ~11-14
    if (normalizeStr(row[11])) contacts.push({ category: 'IT', name: normalizeStr(row[11]), role: normalizeStr(row[12]), phone: normalizeStr(row[13]), email: normalizeStr(row[14]) });
    // Procurement/Maintenance ~15-18
    if (normalizeStr(row[15])) contacts.push({ category: 'MAINTENANCE', name: normalizeStr(row[15]), role: normalizeStr(row[16]), phone: normalizeStr(row[17]), email: normalizeStr(row[18]) });

    const key = networkName.toLowerCase();
    if (!contactsMap.has(key)) contactsMap.set(key, []);
    contactsMap.get(key)!.push(...contacts);
  }

  // Data starts at row index 2 in VIGGO (row 0=empty, row 1=headers, row 2=first data)
  const dataRows = viggoRows.slice(2);
  let successRows = 0;
  const errors: ExcelRow[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 3;

    try {
      const hotelName = normalizeStr(row[5]);
      if (!hotelName) continue; // skip empty rows

      const networkName = normalizeStr(row[4]);
      const hotKey = `${(networkName ?? '').toLowerCase()}|${hotelName.toLowerCase()}`;
      const hotData = hotMap.get(hotKey) ?? {};

      // Upsert network
      let networkId: string | undefined;
      if (networkName) {
        const network = await prisma.hotelNetwork.upsert({
          where: { name: networkName },
          create: { name: networkName },
          update: {},
        });
        networkId = network.id;
      }

      // Contacts from contacts sheet keyed by network
      const contactsKey = (networkName ?? '').toLowerCase();
      const sheetContacts = contactsMap.get(contactsKey) ?? [];

      // Upsert hotel by name + networkId
      const existingHotel = await prisma.hotel.findFirst({
        where: { name: hotelName, ...(networkId ? { networkId } : {}), isDeleted: false },
      });

      const hotelData = {
        contentProvider: normalizeStr(row[1]),
        viggoRegistrationCode: normalizeStr(row[2]),
        technicianCode: normalizeStr(row[3]),
        location: normalizeStr(row[6]),
        serviceSupport: normalizeStr(row[7]),
        deviceType: normalizeStr(row[8]),
        ipConnection: normalizeStr(row[9]),
        channelSource: normalizeStr(row[10]),
        switches: normalizeStr(row[11]),
        salesPerson: normalizeStr(row[12]),
        notes: normalizeStr(row[13]),
        siteContact: normalizeStr(row[14]),
        activeSpareLicenses: normalizeNum(row[15]),
        hotLicenseCount: hotData.count,
        hotLicenseNotes: hotData.notes,
      };

      if (existingHotel) {
        await prisma.hotel.update({
          where: { id: existingHotel.id },
          data: hotelData,
        });
        if (sheetContacts.length > 0) {
          await prisma.contact.deleteMany({ where: { hotelId: existingHotel.id } });
          await prisma.contact.createMany({
            data: sheetContacts.map(c => ({ ...c, hotelId: existingHotel.id, category: c.category as any })),
          });
        }
      } else {
        const newHotel = await prisma.hotel.create({
          data: {
            ...hotelData,
            name: hotelName,
            networkId,
          },
        });
        if (sheetContacts.length > 0) {
          await prisma.contact.createMany({
            data: sheetContacts.map(c => ({ ...c, hotelId: newHotel.id, category: c.category as any })),
          });
        }
      }

      successRows++;
    } catch (err) {
      logger.error(`Import row ${rowNum} failed:`, err);
      errors.push({ index: rowNum, rawRow: row as unknown[], error: String(err) });
    }
  }

  const importRecord = await prisma.importHistory.create({
    data: {
      filename: 'import.xlsx',
      importedBy: userId,
      totalRows: dataRows.length,
      successRows,
      errorRows: errors.length,
      errorsJson: errors.length > 0 ? (errors as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'IMPORT',
      entityType: 'ImportHistory',
      entityId: importRecord.id,
      newValue: { successRows, errorRows: errors.length },
    },
  });

  return { totalRows: dataRows.length, successRows, errorRows: errors.length, errors };
};
