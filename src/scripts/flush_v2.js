const postgres = require('postgres');
const sql = postgres('postgresql://postgres:%3wA.B+j6Yfq%Fx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres', {
  ssl: 'require'
});

async function flush() {
  console.log('Flushing schema cache via DIRECT 5432 connection...');
  try {
    await sql`NOTIFY pgrst, 'reload schema';`;
    console.log('✅ COMPLETE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}
flush();
