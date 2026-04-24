const postgres = require('postgres');
const fs = require('fs');
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
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    let res = '--- ОТЧЕТ ИЗ БАЗЫ ДАННЫХ ---\n';
    tables.forEach(t => res += `Найденная таблица: ${t.table_name}\n`);
    fs.writeFileSync('proof.txt', res);
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('proof.txt', 'ОШИБКА: ' + err.message);
  } finally { await sql.end(); }
}
proveIt();
