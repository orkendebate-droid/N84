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
    console.log('Добавляю поля для верификации...');
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_code TEXT;`;
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`;
    console.log('База готова к проверке через бот!');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

update();
