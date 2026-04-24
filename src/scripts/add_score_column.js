const postgres = require('postgres');
const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require'
});

async function addScoreColumn() {
  console.log('Добавляем колонку рейтинга ИИ...');
  try {
    await sql`
      ALTER TABLE public.applications 
      ADD COLUMN IF NOT EXISTS match_score INTEGER DEFAULT 8;
      
      NOTIFY pgrst, 'reload schema';
    `;
    console.log('✅ Готово!');
    process.exit(0);
  } catch (err) {
    process.exit(1);
  } finally {
    await sql.end();
  }
}
addScoreColumn();
