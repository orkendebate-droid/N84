const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Мы будем использовать те же функции, что и на сервере
const { matchCandidates } = require('../lib/matching');

async function debugMailing() {
  console.log('🧪 СИМУЛЯЦИЯ РАССЫЛКИ (DEBUG)...\n');
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Берем последнюю созданную вакансию
  const { data: vacancy } = await supabase
    .from('vacancies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!vacancy) {
    console.error('❌ Вакансии не найдены в базе!');
    return;
  }

  console.log(`📋 Тестируем для вакансии: "${vacancy.title}" (ID: ${vacancy.id})`);

  // 2. Запускаем матчинг
  console.log('🤖 ИИ анализирует кандидатов...');
  try {
    const matchedUsers = await matchCandidates(vacancy);
    
    if (!matchedUsers || matchedUsers.length === 0) {
      console.log('⚠️ ИИ решил, что ни один из текущих кандидатов не подходит под эту вакансию.');
      
      // Посмотрим, кто вообще есть в базе
      const { data: youths } = await supabase.from('profiles').select('full_name, bio, role').eq('role', 'youth');
      console.log('👥 Список кандидатов в базе:', youths.map(y => `${y.full_name} (${y.bio?.substring(0, 30)}...)`));
      
    } else {
      console.log(`✅ ИИ выбрал ${matchedUsers.length} кандидатов:`);
      matchedUsers.forEach(u => {
        console.log(`  - ${u.full_name} (Score: ${u.match_score}/10) | TG: ${u.telegram_id}`);
      });
      
      // 3. Пробуем "фейковую" отправку
      console.log('\n📱 Статус Telegram Bot Token:', process.env.TELEGRAM_BOT_TOKEN ? 'OK' : 'MISSING');
    }
  } catch (err) {
    console.error('❌ Ошибка в процессе матчинга:', err);
  }
}

debugMailing();
