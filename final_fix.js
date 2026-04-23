const postgres = require('postgres');
const fs = require('fs');

async function connect() {
  const logFile = 'db_final_fix_log.txt';
  fs.writeFileSync(logFile, 'Запуск финальной попытки...\n');
  
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
    fs.appendFileSync(logFile, 'Подключение успешно, создаю таблицы по очереди...\n');
    
    // 1. Вектор
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    fs.appendFileSync(logFile, '1. Extension vector - OK\n');

    // 2. Профили
    await sql`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_id BIGINT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        embedding vector(1536),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    fs.appendFileSync(logFile, '2. Table profiles - OK\n');

    // 3. Вакансии
    await sql`
      CREATE TABLE IF NOT EXISTS public.vacancies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        district TEXT,
        salary TEXT,
        embedding vector(1536),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );
    `;
    fs.appendFileSync(logFile, '3. Table vacancies - OK\n');

    // 4. Отклики
    await sql`
      CREATE TABLE IF NOT EXISTS public.applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
        applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(vacancy_id, applicant_id)
      );
    `;
    fs.appendFileSync(logFile, '4. Table applications - OK\n');
    
    fs.appendFileSync(logFile, '!!! ВСЁ ГОТОВО !!! Я научился управлять вашей базой.\n');
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    fs.appendFileSync(logFile, 'ОШИБКА: ' + err.message + '\n');
    process.exit(1);
  }
}

connect();
