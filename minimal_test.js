const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const logFile = 'db_test_log.txt';
  fs.writeFileSync(logFile, 'Запуск теста...\n');
  
  try {
    const sql = postgres(process.env.DIRECT_URL, { ssl: 'require' });
    fs.appendFileSync(logFile, 'Подключаюсь к: ' + process.env.DIRECT_URL.split('@')[1] + '\n');
    
    const result = await sql`SELECT version();`;
    fs.appendFileSync(logFile, 'УСПЕХ! Версия базы: ' + result[0].version + '\n');
    process.exit(0);
  } catch (err) {
    fs.appendFileSync(logFile, 'ОШИБКА: ' + err.message + '\n' + err.stack);
    process.exit(1);
  }
}

test();
