import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS facilities (
      id SERIAL PRIMARY KEY,
      pref_code INTEGER,
      prefecture VARCHAR(10),
      city VARCHAR(50),
      name VARCHAR(200),
      name_kana VARCHAR(200),
      service_code VARCHAR(10),
      service_name VARCHAR(100),
      address VARCHAR(300),
      building VARCHAR(200),
      lat NUMERIC(10,7),
      lng NUMERIC(10,7),
      tel VARCHAR(20),
      fax VARCHAR(20),
      corp_number VARCHAR(20),
      corp_name VARCHAR(200),
      jigyosho_number VARCHAR(20),
      available_days VARCHAR(100),
      available_days_note TEXT,
      capacity INTEGER,
      url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_facilities_pref_city ON facilities(prefecture, city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_facilities_service ON facilities(service_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_facilities_latlng ON facilities(lat, lng)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_facilities_pref_city_service ON facilities(prefecture, city, service_code)`;

  console.log('Done!');
}

main().catch(console.error);