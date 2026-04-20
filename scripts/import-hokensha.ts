import { neon } from '@neondatabase/serverless';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const BATCH_SIZE = 500;
const FILE_PATH = path.join(__dirname, '..', 'data', '02h.xlsx');

interface Row {
  prefecture: string;
  city: string;
  total: number;
  age65_74: number;
  age75_84: number;
  age85plus: number;
}

function toInt(val: unknown): number {
  if (val == null || val === '' || val === '-' || val === '…') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : Math.round(n);
}

function parseSheet(): Row[] {
  const workbook = XLSX.readFile(FILE_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const rows: Row[] = [];
  let currentPref = '';

  // Data starts from row index 6 (index 5 is "全　国" row)
  for (let i = 5; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 6) continue;

    const prefCell = String(row[0] ?? '').trim();
    const cityCell = String(row[1] ?? '').trim();

    if (prefCell) currentPref = prefCell;

    // Skip "全　国" row
    if (currentPref.replace(/\s/g, '').includes('全国')) continue;

    // Skip empty city or header-like rows
    if (!cityCell || !currentPref || currentPref === '都道府県') continue;

    rows.push({
      prefecture: currentPref,
      city: cityCell,
      total: toInt(row[2]),
      age65_74: toInt(row[3]),
      age75_84: toInt(row[4]),
      age85plus: toInt(row[5]),
    });
  }

  return rows;
}

async function insertBatch(rows: Row[]) {
  if (rows.length === 0) return;

  const values: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  for (const r of rows) {
    const placeholders: string[] = [];
    for (const val of [r.prefecture, r.city, r.total, r.age65_74, r.age75_84, r.age85plus]) {
      placeholders.push(`$${idx++}`);
      params.push(val);
    }
    values.push(`(${placeholders.join(',')})`);
  }

  await sql.query(
    `INSERT INTO kaigo_hokensha (prefecture, city, total, age65_74, age75_84, age85plus)
     VALUES ${values.join(',')}`,
    params,
  );
}

async function main() {
  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS kaigo_hokensha (
      id SERIAL PRIMARY KEY,
      prefecture VARCHAR(20),
      city VARCHAR(50),
      total INTEGER,
      age65_74 INTEGER,
      age75_84 INTEGER,
      age85plus INTEGER,
      year INTEGER DEFAULT 2023
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_hokensha_pref_city ON kaigo_hokensha(prefecture, city)`;

  console.log('Parsing Excel...');
  const rows = parseSheet();
  console.log(`Parsed ${rows.length} rows`);

  await sql`DELETE FROM kaigo_hokensha`;

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await insertBatch(batch);
    inserted += batch.length;
    console.log(`  ${inserted}/${rows.length}`);
  }

  const countResult = await sql`SELECT COUNT(*) AS cnt FROM kaigo_hokensha`;
  console.log(`\nDone! ${countResult[0].cnt} rows in kaigo_hokensha`);

  // Sanity check
  const sample = await sql`SELECT * FROM kaigo_hokensha WHERE prefecture = '北海道' LIMIT 3`;
  console.log('Sample:', sample);
}

main().catch(console.error);
