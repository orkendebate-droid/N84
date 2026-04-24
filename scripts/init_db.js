const postgres = require('postgres');
require('dotenv').config();

// Берем DIRECT_URL из .env.local, который мы только что обновили для IPv4
const sql = postgres(process.env.DIRECT_URL, {
  ssl: 'require',
  connect_timeout: 10
});

async function init() {
  console.log('Подключение к базе по новому адресу...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_id BIGINT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('Успех! База данных готова к регистрации.');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

init();
