const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCandidates() {
  console.log('👥 Проверка пула кандидатов для рассылки...');
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select('username, full_name, role, telegram_id')
    .eq('role', 'youth');

  if (error) {
    console.error('❌ Ошибка:', error);
    return;
  }

  const withId = users.filter(u => u.telegram_id);
  console.log(`📊 Всего молодежи: ${users.length}`);
  console.log(`📱 С привязанным Telegram: ${withId.length}`);
  
  if (withId.length > 0) {
    console.log('✅ Список доступных для рассылки:', withId.map(u => u.username || u.full_name));
  } else {
    console.log('⚠️ ВНИМАНИЕ: Ни у одного кандидата нет telegram_id. Рассылка не сработает, пока ребята не нажмут /start в боте.');
  }
}

checkCandidates();
