const postgres = require('postgres');

async function migrate() {
  const config = {
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: 'postgres.fmweyzcdippvfcsmwnqt',
    password: '%3wA.B+j6Yfq%Fx',
    ssl: 'require'
  };

  try {
    const sql = postgres(config);
    console.log('Делаю telegram_id необязательным для ручной регистрации...');
    await sql`ALTER TABLE public.profiles ALTER COLUMN telegram_id DROP NOT NULL;`;
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;`;
    console.log('Готово!');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

migrate();
