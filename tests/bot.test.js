const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function testBot() {
  console.log('🧪 ЗАПУСК ТЕСТА TELEGRAM BOT API\n');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'SauraN84_bot';

  if (!botToken) {
    console.error('❌ Ошибка: В .env.local не найден TELEGRAM_BOT_TOKEN');
    return;
  }

  // 1. Проверяем токен через GetMe
  console.log(`--- Этап 1: Проверка токена (@${botUsername}) ---`);
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Токен валиден! Бот: ${data.result.first_name} ID: ${data.result.id}`);
    } else {
      console.error('❌ Ошибка токена:', data.description);
    }
  } catch (err) {
    console.error('❌ Ошибка сети:', err.message);
  }

  // 2. Проверяем Webhook
  console.log('\n--- Этап 2: Проверка Webhook (Vercel) ---');
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const data = await res.json();
    if (data.ok) {
      console.log('✅ Настройки Webhook получены:');
      console.log(`🔗 URL: ${data.result.url || 'НЕ УСТАНОВЛЕН (бот работает на Long Polling или не настроен)'}`);
      console.log(`🚨 Необработанных ошибок: ${data.result.pending_update_count || 0}`);
      
      if (data.result.last_error_message) {
        console.error(`⚠️ Последняя ошибка Webhook: ${data.result.last_error_message}`);
      }
    }
  } catch (err) {
    console.error('❌ Ошибка связи с Telegram:', err.message);
  }

  // 3. Проверка API эндпоинта на Vercel
  console.log('\n--- Этап 3: Проверка вашего API (/api/bot) ---');
  try {
    const vercelUrl = 'https://n84-platform.vercel.app/api/bot';
    console.log(`📦 Пингую ваш сервер: ${vercelUrl}`);
    const res = await fetch(vercelUrl, { method: 'GET' }); // Бот на GET обычно отвечает 405 или 200 если разрешено
    
    if (res.status !== 404) {
      console.log(`✅ Эндпоинт доступен (Статус: ${res.status})`);
    } else {
      console.error('❌ Ошибка 404: Эндпоинт /api/bot не найден на сервере!');
    }
  } catch (err) {
    console.error('❌ Сервер Vercel не отвечает:', err.message);
  }

  console.log('\n🏁 Тест Bot API завершен.');
}

testBot();
