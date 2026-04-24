/**
 * N84 Platform — Official Health Check
 * БЕЗОПАСНАЯ ВЕРСИЯ ДЛЯ GITHUB
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runCheck() {
  console.log('🧪 Глобальная проверка систем N84...');
  
  // Проверка базы
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  if (error) console.error('❌ Ошибка БД:', error.message);
  else console.log('✅ База данных доступна.');

  // Проверка ИИ (Проверка только наличия ключа)
  if (process.env.QWEN_API_KEY) console.log('✅ Ключ ИИ настроен.');
  else console.error('❌ Ключ ИИ отсутствует!');

  // Проверка Бота
  if (process.env.TELEGRAM_BOT_TOKEN) console.log('✅ Токен Telegram настроен.');
  else console.error('❌ Токен Telegram отсутствует!');

  console.log('\n🏁 Проверка завершена.');
}

runCheck();
