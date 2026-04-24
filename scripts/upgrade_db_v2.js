const postgres = require('postgres');

async function upgrade() {
  const sql = postgres({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: 'postgres.fmweyzcdippvfcsmwnqt',
    password: '%3wA.B+j6Yfq%Fx',
    ssl: 'require'
  });

  try {
    console.log('Обновляю таблицу вакансий и создаю таблицу откликов...');
    
    // Добавляем новые поля в вакансии
    await sql`
      ALTER TABLE public.vacancies 
      ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full_time',
      ADD COLUMN IF NOT EXISTS industry TEXT,
      ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT 'no_experience';
    `;

    // Создаем таблицу откликов
    await sql`
      CREATE TABLE IF NOT EXISTS public.applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
        youth_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log('База данных успешно обновлена! ✅');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

upgrade();
