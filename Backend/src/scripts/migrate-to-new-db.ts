/**
 * migrate-to-new-db.ts
 * Copies all data from DATABASE_URL → NEW_DATABASE_URL
 *
 * Usage:
 *   1. Fill NEW_DATABASE_URL in .env
 *   2. Run: npx ts-node src/scripts/migrate-to-new-db.ts
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const SOURCE_URL = process.env.DATABASE_URL!;
const DEST_URL   = process.env.NEW_DATABASE_URL!;

if (!SOURCE_URL) { console.error('❌  DATABASE_URL is missing in .env'); process.exit(1); }
if (!DEST_URL)   { console.error('❌  NEW_DATABASE_URL is missing in .env'); process.exit(1); }

// Tables in dependency order (parents before children)
const TABLES = [
  'users',
  'hotel_networks',
  'hotels',
  'contacts',
  'audit_logs',
  'import_history',
  'refresh_tokens',
] as const;

async function migrate() {
  const src  = new Client({ connectionString: SOURCE_URL, ssl: { rejectUnauthorized: false } });
  const dest = new Client({ connectionString: DEST_URL,   ssl: { rejectUnauthorized: false } });

  console.log('🔌  Connecting to source & destination databases...');
  await src.connect();
  await dest.connect();
  console.log('✅  Connected.\n');

  try {
    // Disable FK + trigger checks on destination so we can insert in bulk
    await dest.query("SET session_replication_role = replica;");

    for (const table of TABLES) {
      const { rows } = await src.query(`SELECT * FROM "${table}"`);

      if (rows.length === 0) {
        console.log(`⏭️   ${table}: 0 rows — skipping`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colList  = columns.map(c => `"${c}"`).join(', ');

      // Build $1, $2, ... placeholders per row
      const valuePlaceholders = rows.map((_, rowIdx) =>
        `(${columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`).join(', ')})`
      ).join(', ');

      const flatValues = rows.flatMap(row => columns.map(c => row[c]));

      await dest.query(
        `INSERT INTO "${table}" (${colList}) VALUES ${valuePlaceholders}
         ON CONFLICT DO NOTHING`,
        flatValues
      );

      console.log(`✅  ${table}: ${rows.length} rows copied`);
    }

    // Re-enable FK + trigger checks
    await dest.query("SET session_replication_role = DEFAULT;");

    console.log('\n🎉  Migration complete!');
  } catch (err) {
    await dest.query("SET session_replication_role = DEFAULT;").catch(() => {});
    console.error('\n❌  Migration failed:', err);
    process.exit(1);
  } finally {
    await src.end();
    await dest.end();
  }
}

migrate();
