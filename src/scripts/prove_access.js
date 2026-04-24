const postgres = require('postgres');
const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.fmweyzcdippvfcsmwnqt',
  password: '%3wA.B+j6Yfq%Fx',
  ssl: 'require'
});

async function proveIt() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('--- ТАБЛИЦЫ В ВАШЕЙ БАЗЕ ---');
    tables.forEach(t => console.log('📍 ' + t.table_name));
    console.log('---------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка доступа:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}
proveIt();
