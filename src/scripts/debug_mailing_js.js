const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function askQwen(prompt, systemPrompt) {
  const aiRes = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL || "qwen-plus",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      extra_body: { "enable_thinking": false }
    })
  });
  const data = await aiRes.json();
  return data.choices?.[0]?.message?.content || null;
}

async function debugMailing() {
  console.log('🧪 СИМУЛЯЦИЯ РАССЫЛКИ (PURE JS)...\n');
  
  // 1. Берем последнюю вакансию
  const { data: vacancy } = await supabase
    .from('vacancies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!vacancy) {
    console.error('❌ Вакансии не найдены!');
    return;
  }

  console.log(`📋 Вакансия: "${vacancy.title}"`);

  // 2. Берем кандидатов
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, address, bio, user_age, telegram_id')
    .eq('role', 'youth')
    .not('telegram_id', 'is', null);

  if (!users || users.length === 0) {
    console.log('⚠️ Нет кандидатов с telegram_id в базе.');
    return;
  }

  // 3. Промпт ИИ
  const prompt = `
    ВАКАНСИЯ:
    Название: ${vacancy.title}
    Описание: ${vacancy.description}
    Место: ${vacancy.area}

    КАНДИДАТЫ:
    ${users.map((u, i) => `${i+1}. [ID: ${u.id}] ${u.full_name}, О себе: ${u.bio}`).join('\n')}

    ЗАДАЧА: Верни только JSON массив [{"id": "uuid", "score": 9}] для тех, у кого score >= 5.
  `;

  console.log('🤖 Запрос к ИИ...');
  const content = await askQwen(prompt, "Return ONLY valid JSON array.");
  
  if (!content) {
    console.log('❌ ИИ не ответил.');
    return;
  }

  console.log('📝 Ответ ИИ:', content);

  try {
    const results = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    console.log(`✅ ИИ выбрал ${results.length} человек.`);
    
    // Проверка Бота
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && results.length > 0) {
        console.log('📱 Токен бота на месте, рассылка ДОЛЖНА работать.');
    }
  } catch (e) {
    console.log('❌ Ошибка парсинга JSON от ИИ.');
  }
}

debugMailing();
