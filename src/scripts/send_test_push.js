const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function sendTestPush() {
  console.log('🚀 ЗАПУСК ТЕСТОВОЙ РАССЫЛКИ ВСЕМ КАНДИДАТАМ...\n');

  if (!botToken) {
    console.error('❌ Ошибка: Не найден TELEGRAM_BOT_TOKEN в .env.local');
    return;
  }

  // 1. Получаем всех пользователей, у которых указан telegram_id
  const { data: users, error } = await supabase
    .from('profiles')
    .select('telegram_id, full_name, username')
    .not('telegram_id', 'is', null);

  if (error) {
    console.error('❌ Ошибка БД:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️ В базе нет ни одного пользователя с telegram_id. Никому отправлять.');
    return;
  }

  console.log(`📋 Нашли ${users.length} пользователей. Начинаем рассылку...\n`);

  let successCount = 0;
  let failCount = 0;

  // 2. Рассылаем каждому
  for (const user of users) {
    try {
      const message = `🔔 *ТЕСТОВОЕ УВЕДОМЛЕНИЕ N84*\n\nПривет, ${user.full_name || 'друг'}! 👋\nЭто проверка связи от нашей системы. Твои уведомления настроены и работают на 100%!\n\nГотовься ловить лучшие вакансии Актау. 🚀`;
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: 'Открыть N84 💼', web_app: { url: 'https://n84-platform.vercel.app/' } }
          ]
        ]
      };

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard
        })
      });

      const json = await res.json();
      
      if (json.ok) {
        console.log(`✅ Успешно отправлено: ${user.full_name} (@${user.username || 'без_ника'})`);
        successCount++;
      } else {
        console.error(`❌ Ошибка отправки для ${user.full_name}: ${json.description}`);
        failCount++;
      }
    } catch (err) {
      console.error(`❌ Сетевая ошибка для ${user.full_name}:`, err.message);
      failCount++;
    }
    
    // Небольшая задержка, чтобы Телеграм не заблокировал за спам (если людей будет много)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🏁 РАССЫЛКА ЗАВЕРШЕНА');
  console.log(`🟢 Успешно: ${successCount}`);
  console.log(`🔴 Ошибок: ${failCount}`);
}

sendTestPush();
