const postgres = require('postgres');

async function setup() {
  const sql = postgres({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: 'postgres.fmweyzcdippvfcsmwnqt',
    password: '%3wA.B+j6Yfq%Fx',
    ssl: 'require'
  });

  try {
    console.log('Создаю таблицу вакансий...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.vacancies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        salary TEXT,
        area TEXT,
        requirements TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('Таблица вакансий готова!');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

setup();
