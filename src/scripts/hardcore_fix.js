const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Мы не используем DATABASE_URL как строку, а вводим параметры вручную, 
// чтобы избежать ошибок с символами % в пароле
const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx', // Ваш пароль как есть
  ssl: 'require'
});

async function safeFix() {
  console.log('🏗️ Прямое подключение к БД (Manual Config)...');
  
  try {
    // 1. Включаем расширение
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('✅ Extension vector: OK');

    // 2. Добавляем колонку в profiles
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS embedding vector(1536);`;
    console.log('✅ Profiles embedding: OK');

    // 3. Добавляем колонку в vacancies
    await sql`ALTER TABLE public.vacancies ADD COLUMN IF NOT EXISTS embedding vector(1536);`;
    console.log('✅ Vacancies embedding: OK');

    console.log('🎉 БАЗА НАСТРОЕНА! Теперь тесты будут зелеными.');
    process.exit(0);
  } catch (err) {
    console.error('❌ ОШИБКА:', err.message);
    process.exit(1);
  }
}

safeFix();
