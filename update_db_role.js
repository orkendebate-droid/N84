const postgres = require('postgres');

async function update() {
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
    console.log('Добавляю колонку role в profiles...');
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;`;
    console.log('Успех! База обновлена.');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

update();
