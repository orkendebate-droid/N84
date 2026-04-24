const postgres = require('postgres');
const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require'
});

async function addAgeColumn() {
  try {
    await sql`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_age TEXT;
      NOTIFY pgrst, 'reload schema';
    `;
    console.log('✅ Column user_age added!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}
addAgeColumn();
