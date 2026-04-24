const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require'
});

async function finalCheck() {
  console.log('🕵️‍♂️ ОКОНЧАТЕЛЬНАЯ ПРОВЕРКА КОЛОНОК...');
  
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND table_schema = 'public';
    `;
    
    console.log('📋 Список всех колонок в public.profiles:');
    columns.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
    
    const hasVector = columns.some(c => c.column_name === 'embedding');
    if (hasVector) {
      console.log('✅ ВЕКТОРНАЯ КОЛОНКА НАЙДЕНА! Тесты просто ошибались.');
    } else {
      console.log('❌ КОЛОНКИ НЕТ. Попробую создать её ЕЩЁ РАЗ БЕЗ IF NOT EXISTS.');
      await sql`ALTER TABLE public.profiles ADD COLUMN embedding vector(1536);`;
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ОШИБКА:', err.message);
    process.exit(1);
  }
}

finalCheck();
