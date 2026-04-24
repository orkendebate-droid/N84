const postgres = require('postgres');
const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres', {
  ssl: 'require'
});

async function forceChange() {
  console.log('FORCE changing type with DIRECT connection...');
  try {
    await sql`
      -- Принудительно меняем тип через конвертацию в текст
      ALTER TABLE public.profiles 
      ALTER COLUMN birthday TYPE TEXT USING birthday::text;
      
      NOTIFY pgrst, 'reload schema';
    `;
    console.log('✅ TYPE CHANGED!');
    process.exit(0);
  } catch (err) {
    console.error('❌ SQL ERROR:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}
forceChange();
