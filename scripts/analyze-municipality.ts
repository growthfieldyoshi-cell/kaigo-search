import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

type PrefCity = { prefecture: string; city: string };

async function getUniquePrefCities(table: string): Promise<Set<string>> {
  const rows: PrefCity[] = await sql.query(
    `SELECT DISTINCT prefecture, city
     FROM ${table}
     WHERE prefecture IS NOT NULL AND city IS NOT NULL
       AND prefecture != '' AND city != ''
     ORDER BY prefecture, city`,
    [],
  ) as PrefCity[];
  return new Set(rows.map((r) => `${r.prefecture}\t${r.city}`));
}

function compare(
  labelA: string,
  setA: Set<string>,
  labelB: string,
  setB: Set<string>,
) {
  const both: string[] = [];
  const onlyA: string[] = [];
  const onlyB: string[] = [];

  for (const key of setA) {
    if (setB.has(key)) both.push(key);
    else onlyA.push(key);
  }
  for (const key of setB) {
    if (!setA.has(key)) onlyB.push(key);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${labelA} ↔ ${labelB}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  一致:              ${both.length}`);
  console.log(`  ${labelA} のみ:    ${onlyA.length}`);
  console.log(`  ${labelB} のみ:    ${onlyB.length}`);

  if (onlyA.length > 0) {
    console.log(`\n  --- ${labelA} のみ（先頭30件） ---`);
    for (const key of onlyA.slice(0, 30)) {
      const [pref, city] = key.split('\t');
      console.log(`    ${pref} / ${city}`);
    }
    if (onlyA.length > 30) console.log(`    ... 他 ${onlyA.length - 30} 件`);
  }

  if (onlyB.length > 0) {
    console.log(`\n  --- ${labelB} のみ（先頭30件） ---`);
    for (const key of onlyB.slice(0, 30)) {
      const [pref, city] = key.split('\t');
      console.log(`    ${pref} / ${city}`);
    }
    if (onlyB.length > 30) console.log(`    ... 他 ${onlyB.length - 30} 件`);
  }
}

async function main() {
  console.log('市区町村名 表記ゆれ調査\n');

  const [facilities, ninteisha, hokensha] = await Promise.all([
    getUniquePrefCities('facilities'),
    getUniquePrefCities('kaigo_ninteisha'),
    getUniquePrefCities('kaigo_hokensha'),
  ]);

  console.log(`facilities       ユニーク市区町村数: ${facilities.size}`);
  console.log(`kaigo_ninteisha  ユニーク市区町村数: ${ninteisha.size}`);
  console.log(`kaigo_hokensha   ユニーク市区町村数: ${hokensha.size}`);

  compare('facilities', facilities, 'kaigo_ninteisha', ninteisha);
  compare('facilities', facilities, 'kaigo_hokensha', hokensha);
}

main().catch(console.error);
