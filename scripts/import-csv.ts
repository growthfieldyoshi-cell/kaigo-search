import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const BATCH_SIZE = 500;
const DATA_DIR = path.join(__dirname, '..', 'data');

interface CsvRow {
  pref_city_code: string;
  no: string;
  prefecture: string;
  city: string;
  name: string;
  name_kana: string;
  service_name: string;
  address: string;
  building: string;
  lat: string;
  lng: string;
  tel: string;
  fax: string;
  corp_number: string;
  corp_name: string;
  jigyosho_number: string;
  available_days: string;
  available_days_note: string;
  capacity: string;
  url: string;
}

const CSV_COLUMNS = [
  'pref_city_code', 'no', 'prefecture', 'city', 'name', 'name_kana',
  'service_name', 'address', 'building', 'lat', 'lng', 'tel', 'fax',
  'corp_number', 'corp_name', 'jigyosho_number', 'available_days',
  'available_days_note', 'capacity', 'url',
];

function extractServiceCode(filename: string): string {
  const match = filename.match(/jigyosho_(\d+)\.csv$/);
  if (!match) throw new Error(`Cannot extract service code from: ${filename}`);
  return match[1];
}

function parsePrefCode(prefCityCode: string): number | null {
  if (!prefCityCode) return null;
  const code = parseInt(prefCityCode.substring(0, 2), 10);
  return isNaN(code) ? null : code;
}

async function insertBatch(rows: CsvRow[], serviceCode: string) {
  if (rows.length === 0) return;

  const values: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  for (const row of rows) {
    const prefCode = parsePrefCode(row.pref_city_code);
    const lat = row.lat ? parseFloat(row.lat) : null;
    const lng = row.lng ? parseFloat(row.lng) : null;
    const capacity = row.capacity ? parseInt(row.capacity, 10) : null;

    const placeholders = [];
    for (const val of [
      prefCode, row.prefecture || null, row.city || null,
      row.name || null, row.name_kana || null, serviceCode,
      row.service_name || null, row.address || null, row.building || null,
      lat, lng, row.tel || null, row.fax || null,
      row.corp_number || null, row.corp_name || null,
      row.jigyosho_number || null, row.available_days || null,
      row.available_days_note || null,
      isNaN(capacity as number) ? null : capacity,
      row.url || null,
    ]) {
      placeholders.push(`$${paramIndex++}`);
      params.push(val);
    }
    values.push(`(${placeholders.join(',')})`);
  }

  const query = `
    INSERT INTO facilities (
      pref_code, prefecture, city, name, name_kana, service_code,
      service_name, address, building, lat, lng, tel, fax,
      corp_number, corp_name, jigyosho_number, available_days,
      available_days_note, capacity, url
    ) VALUES ${values.join(',')}
  `;

  await sql.query(query, params);
}

async function processFile(filePath: string) {
  const filename = path.basename(filePath);
  const serviceCode = extractServiceCode(filename);

  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const records: CsvRow[] = parse(raw, {
    columns: CSV_COLUMNS,
    from_line: 2, // skip header
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`  ${filename}: ${records.length} records (service_code=${serviceCode})`);

  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await insertBatch(batch, serviceCode);
    inserted += batch.length;
    if (inserted % 2000 === 0 || inserted === records.length) {
      console.log(`    ${inserted}/${records.length}`);
    }
  }
}

async function main() {
  // Check already imported service codes
  const existing = await sql`SELECT DISTINCT service_code FROM facilities`;
  const importedCodes = new Set(existing.map((r: Record<string, string>) => r.service_code));

  const files = fs.readdirSync(DATA_DIR)
    .filter(f => /^jigyosho_\d+\.csv$/.test(f))
    .sort()
    .map(f => path.join(DATA_DIR, f));

  console.log(`Found ${files.length} CSV files (${importedCodes.size} already imported)`);

  for (const file of files) {
    const code = extractServiceCode(path.basename(file));
    if (importedCodes.has(code)) {
      console.log(`  Skipping ${path.basename(file)} (already imported)`);
      continue;
    }
    await processFile(file);
  }

  console.log(`\nDone! Processed ${files.length} files.`);
}

main().catch(console.error);
