import { neon } from '@neondatabase/serverless';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const BATCH_SIZE = 500;
const FILE_PATH = path.join(__dirname, '..', 'data', '04-1-1h.xlsx');

interface Row {
  prefecture: string;
  city: string;
  yoshien1: number;
  yoshien2: number;
  yokaigo1: number;
  yokaigo2: number;
  yokaigo3: number;
  yokaigo4: number;
  yokaigo5: number;
  total: number;
}

function toInt(val: unknown): number {
  if (val == null || val === '' || val === '-' || val === '…') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : Math.round(n);
}

function parseSheets(): Row[] {
  const workbook = XLSX.readFile(FILE_PATH);
  const rows: Row[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    let currentPref = '';

    // Data starts from row index 4 (5th row, after header at row index 3)
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 3) continue;

      const prefCell = String(row[0] ?? '').trim();
      const cityCell = String(row[1] ?? '').trim();

      // Update prefecture if present
      if (prefCell) {
        currentPref = prefCell;
      }

      // Skip "全　国" row and empty city rows
      if (!cityCell) continue;
      if (currentPref.includes('全') && currentPref.includes('国')) continue;
      if (cityCell.includes('全') && cityCell.includes('国')) continue;

      // Skip summary/header-like rows
      if (!currentPref || currentPref === '都道府県') continue;

      rows.push({
        prefecture: currentPref,
        city: cityCell,
        yoshien1: toInt(row[2]),
        yoshien2: toInt(row[3]),
        yokaigo1: toInt(row[4]),
        yokaigo2: toInt(row[5]),
        yokaigo3: toInt(row[6]),
        yokaigo4: toInt(row[7]),
        yokaigo5: toInt(row[8]),
        total: toInt(row[9]),
      });
    }
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
    for (const val of [
      r.prefecture, r.city,
      r.yoshien1, r.yoshien2,
      r.yokaigo1, r.yokaigo2, r.yokaigo3, r.yokaigo4, r.yokaigo5,
      r.total,
    ]) {
      placeholders.push(`$${idx++}`);
      params.push(val);
    }
    values.push(`(${placeholders.join(',')})`);
  }

  await sql.query(
    `INSERT INTO kaigo_ninteisha (
      prefecture, city,
      yoshien1, yoshien2,
      yokaigo1, yokaigo2, yokaigo3, yokaigo4, yokaigo5,
      total
    ) VALUES ${values.join(',')}`,
    params,
  );
}

async function main() {
  console.log('Creating table...');
  await sql`
    CREATE TABLE IF NOT EXISTS kaigo_ninteisha (
      id SERIAL PRIMARY KEY,
      prefecture VARCHAR(20),
      city VARCHAR(50),
      yoshien1 INTEGER,
      yoshien2 INTEGER,
      yokaigo1 INTEGER,
      yokaigo2 INTEGER,
      yokaigo3 INTEGER,
      yokaigo4 INTEGER,
      yokaigo5 INTEGER,
      total INTEGER,
      year INTEGER DEFAULT 2023
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ninteisha_pref_city ON kaigo_ninteisha(prefecture, city)`;

  console.log('Parsing Excel...');
  const rows = parseSheets();
  console.log(`Parsed ${rows.length} rows from all sheets`);

  // Clear existing data before import
  await sql`DELETE FROM kaigo_ninteisha`;

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await insertBatch(batch);
    inserted += batch.length;
    console.log(`  ${inserted}/${rows.length}`);
  }

  // Verify
  const countResult = await sql`SELECT COUNT(*) AS cnt FROM kaigo_ninteisha`;
  console.log(`\nDone! ${countResult[0].cnt} rows in kaigo_ninteisha`);
}

main().catch(console.error);
