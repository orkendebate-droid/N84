const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DIRECT_URL, {
  ssl: 'require',
  connect_timeout: 15
});

async function run() {
  console.log('Попытка №...');
  try {
    await sql`SELECT 1`;
    const res = await sql`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_id BIGINT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    fs.writeFileSync('db_final_log.txt', 'SUCCESS: Connection and Table creation worked!');
    process.exit(0);
  } catch (err) {
    const errorDetails = {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      stack: err.stack
    };
    fs.writeFileSync('db_final_log.txt', 'FAILURE:\n' + JSON.stringify(errorDetails, null, 2));
    process.exit(1);
  }
}

run();
