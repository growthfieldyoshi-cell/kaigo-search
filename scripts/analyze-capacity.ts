import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

const RESIDENTIAL_CODES = ['210', '220', '230', '320', '331', '332', '334', '335', '336', '337'];

function pct(n: number, total: number): string {
  if (total === 0) return '-';
  return (n / total * 100).toFixed(1) + '%';
}

function padR(s: string, len: number): string {
  const fullWidthCount = [...s].filter((c) => c.charCodeAt(0) > 0xff).length;
  return s + ' '.repeat(Math.max(0, len - s.length - fullWidthCount));
}

async function main() {
  console.log('facilities.capacity データ品質分析\n');

  // ── 1. 全 service_code 別集計 ──

  const allStats = await sql`
    SELECT
      service_code,
      service_name,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE capacity IS NULL) AS null_count,
      COUNT(*) FILTER (WHERE capacity = 0) AS zero_count,
      COUNT(*) FILTER (WHERE capacity > 500) AS over500_count,
      AVG(capacity) FILTER (WHERE capacity > 0) AS avg_cap,
      MAX(capacity) AS max_cap
    FROM facilities
    GROUP BY service_code, service_name
    ORDER BY service_code
  `;

  console.log('='.repeat(120));
  console.log('1. 全サービス種別 capacity 集計');
  console.log('='.repeat(120));
  console.log(
    padR('code', 6) + padR('service_name', 30) +
    padR('total', 8) + padR('NULL', 8) + padR('NULL%', 8) +
    padR('zero', 8) + padR('>500', 8) + padR('avg', 8) + 'max'
  );
  console.log('-'.repeat(120));

  for (const r of allStats) {
    const total = Number(r.total);
    const nullCount = Number(r.null_count);
    const zeroCount = Number(r.zero_count);
    const over500 = Number(r.over500_count);
    const avg = r.avg_cap ? Number(r.avg_cap).toFixed(1) : '-';
    const max = r.max_cap ?? '-';
    console.log(
      padR(r.service_code, 6) + padR(r.service_name, 30) +
      padR(String(total), 8) + padR(String(nullCount), 8) + padR(pct(nullCount, total), 8) +
      padR(String(zeroCount), 8) + padR(String(over500), 8) + padR(String(avg), 8) + max
    );
  }

  // ── 2. 入所系サービスのみ ──

  console.log(`\n${'='.repeat(120)}`);
  console.log('2. 入所系サービス候補 capacity 集計');
  console.log('='.repeat(120));

  const residential = allStats.filter((r: Record<string, unknown>) =>
    RESIDENTIAL_CODES.includes(r.service_code as string)
  );

  console.log(
    padR('code', 6) + padR('service_name', 30) +
    padR('total', 8) + padR('NULL', 8) + padR('NULL%', 8) +
    padR('zero', 8) + padR('zero%', 8) + padR('>500', 8) + padR('avg', 8) + 'max'
  );
  console.log('-'.repeat(120));

  let rTotal = 0, rNull = 0, rZero = 0, rOver500 = 0;
  for (const r of residential) {
    const total = Number(r.total);
    const nullCount = Number(r.null_count);
    const zeroCount = Number(r.zero_count);
    const over500 = Number(r.over500_count);
    rTotal += total; rNull += nullCount; rZero += zeroCount; rOver500 += over500;
    const avg = r.avg_cap ? Number(r.avg_cap).toFixed(1) : '-';
    const max = r.max_cap ?? '-';
    console.log(
      padR(r.service_code, 6) + padR(r.service_name, 30) +
      padR(String(total), 8) + padR(String(nullCount), 8) + padR(pct(nullCount, total), 8) +
      padR(String(zeroCount), 8) + padR(pct(zeroCount, total), 8) +
      padR(String(over500), 8) + padR(String(avg), 8) + max
    );
  }
  console.log('-'.repeat(120));
  console.log(
    padR('', 6) + padR('合計', 30) +
    padR(String(rTotal), 8) + padR(String(rNull), 8) + padR(pct(rNull, rTotal), 8) +
    padR(String(rZero), 8) + padR(pct(rZero, rTotal), 8) +
    padR(String(rOver500), 8)
  );

  // ── 3. capacity = 0 の内訳（入所系） ──

  console.log(`\n${'='.repeat(80)}`);
  console.log('3. 入所系 capacity = 0 サンプル（先頭20件）');
  console.log('='.repeat(80));

  const zeroSamples = await sql`
    SELECT id, prefecture, city, name, service_code, service_name, capacity
    FROM facilities
    WHERE capacity = 0
      AND service_code = ANY(${RESIDENTIAL_CODES})
    ORDER BY service_code, prefecture, city
    LIMIT 20
  `;
  for (const r of zeroSamples) {
    console.log(`  [${r.service_code}] ${r.prefecture} ${r.city} / ${r.name} (capacity=${r.capacity})`);
  }
  if (zeroSamples.length === 0) console.log('  (該当なし)');

  // ── 4. capacity > 500 の異常値（入所系） ──

  console.log(`\n${'='.repeat(80)}`);
  console.log('4. 入所系 capacity > 500（異常値候補）');
  console.log('='.repeat(80));

  const overSamples = await sql`
    SELECT id, prefecture, city, name, service_code, service_name, capacity
    FROM facilities
    WHERE capacity > 500
      AND service_code = ANY(${RESIDENTIAL_CODES})
    ORDER BY capacity DESC
    LIMIT 30
  `;
  for (const r of overSamples) {
    console.log(`  [${r.service_code}] ${r.prefecture} ${r.city} / ${r.name} (capacity=${r.capacity})`);
  }
  if (overSamples.length === 0) console.log('  (該当なし)');

  // ── 5. confirmed マッピング対象のみの集計 ──

  console.log(`\n${'='.repeat(120)}`);
  console.log('5. municipality_mapping confirmed 対象のみ（入所系）');
  console.log('='.repeat(120));

  const confirmedStats = await sql`
    SELECT
      f.service_code,
      f.service_name,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE f.capacity IS NULL) AS null_count,
      COUNT(*) FILTER (WHERE f.capacity = 0) AS zero_count,
      COUNT(*) FILTER (WHERE f.capacity > 0) AS valid_count,
      AVG(f.capacity) FILTER (WHERE f.capacity > 0) AS avg_cap,
      SUM(f.capacity) FILTER (WHERE f.capacity > 0) AS sum_cap
    FROM facilities f
    INNER JOIN municipality_mapping m
      ON m.source_table = 'facilities'
      AND m.prefecture = f.prefecture
      AND m.city_raw = f.city
      AND m.status = 'confirmed'
    WHERE f.service_code = ANY(${RESIDENTIAL_CODES})
    GROUP BY f.service_code, f.service_name
    ORDER BY f.service_code
  `;

  console.log(
    padR('code', 6) + padR('service_name', 30) +
    padR('total', 8) + padR('valid', 8) + padR('valid%', 8) +
    padR('NULL', 8) + padR('zero', 8) + padR('avg', 8) + 'sum_cap'
  );
  console.log('-'.repeat(120));

  let cTotal = 0, cValid = 0, cNull2 = 0, cZero2 = 0;
  for (const r of confirmedStats) {
    const total = Number(r.total);
    const valid = Number(r.valid_count);
    const nullCount = Number(r.null_count);
    const zeroCount = Number(r.zero_count);
    cTotal += total; cValid += valid; cNull2 += nullCount; cZero2 += zeroCount;
    const avg = r.avg_cap ? Number(r.avg_cap).toFixed(1) : '-';
    const sumCap = r.sum_cap ?? '-';
    console.log(
      padR(r.service_code, 6) + padR(r.service_name, 30) +
      padR(String(total), 8) + padR(String(valid), 8) + padR(pct(valid, total), 8) +
      padR(String(nullCount), 8) + padR(String(zeroCount), 8) + padR(String(avg), 8) + sumCap
    );
  }
  console.log('-'.repeat(120));
  console.log(
    padR('', 6) + padR('合計', 30) +
    padR(String(cTotal), 8) + padR(String(cValid), 8) + padR(pct(cValid, cTotal), 8) +
    padR(String(cNull2), 8) + padR(String(cZero2), 8)
  );

  // ── 6. 判定サマリ ──

  console.log(`\n${'='.repeat(60)}`);
  console.log('判定サマリ');
  console.log('='.repeat(60));
  console.log(`  入所系 全体:         ${rTotal}件`);
  console.log(`  capacity NULL:       ${rNull}件 (${pct(rNull, rTotal)})`);
  console.log(`  capacity = 0:        ${rZero}件 (${pct(rZero, rTotal)})`);
  console.log(`  capacity > 500:      ${rOver500}件`);
  console.log(`  confirmed 対象:      ${cTotal}件`);
  console.log(`  confirmed valid:     ${cValid}件 (${pct(cValid, cTotal)})`);
  const usable = rTotal - rNull;
  console.log(`  capacity 有効(>= 0): ${usable}件 (${pct(usable, rTotal)})`);
}

main().catch(console.error);
