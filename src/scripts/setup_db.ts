import postgres from 'postgres'
import 'dotenv/config'

const sql = postgres(process.env.DIRECT_URL!)

async function setup() {
  console.log('🚀 Начинаю настройку базы данных (pgvector + таблицы)...')
  
  try {
    // 1. Включаем расширение pgvector
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`
    console.log('✅ Расширение vector включено')

    // 2. Создаем таблицу профилей (на случай если еще нет)
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
    `
    console.log('✅ Таблица profiles готова')

    // 3. Создаем таблицу вакансий
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
    `
    console.log('✅ Таблица vacancies готова')

    // 4. Создаем таблицу откликов
    await sql`
      CREATE TABLE IF NOT EXISTS public.applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
        applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(vacancy_id, applicant_id)
      );
    `
    console.log('✅ Таблица applications готова')

    console.log('🎉 База данных полностью готова к работе с AI и RAG!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при настройке базы:', error)
    process.exit(1)
  }
}

setup()
