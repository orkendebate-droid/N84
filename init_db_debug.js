const postgres = require('postgres');
const fs = require('fs');

const connectionConfig = {
  host: 'db.fmweyzcdippvfcsmwnqt.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require',
  connect_timeout: 10
};

const sql = postgres(connectionConfig);

async function init() {
  try {
    await sql`SELECT 1`;
    fs.writeFileSync('db_log.txt', 'Connection successful!');
    
    await sql`
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
    fs.appendFileSync('db_log.txt', '\nTable profiles created successfully.');
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('db_log.txt', 'Error: ' + err.message + '\n' + err.stack);
    process.exit(1);
  }
}

init();
