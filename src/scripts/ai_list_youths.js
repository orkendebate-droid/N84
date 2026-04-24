const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function askQwen(prompt) {
  const aiRes = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL || "qwen-max",
      messages: [
        { role: "system", content: "Ты дружелюбный ассистент." },
        { role: "user", content: prompt }
      ],
      enable_thinking: false
    })
  });
  const data = await aiRes.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content?.trim();
}

async function run() {
  console.log('🔍 Запрашиваем информацию из БД...');
  
  // 1. Достаем всех молодежников (role = 'youth')
  const { data: youths, error } = await supabase
    .from('profiles')
    .select('full_name, user_age, bio')
    .eq('role', 'youth');

  if (error) {
    console.error('❌ Ошибка базы данных:', error);
    return;
  }

  if (!youths || youths.length === 0) {
    console.log('В базе нет ни одного молодежника!');
    return;
  }

  console.log(`✅ Найдено в базе: ${youths.length} человек.`);
  
  // 2. Формируем контекст для ИИ
  const candidatesData = youths.map(y => `- ${y.full_name} (возраст: ${y.user_age || 'не указан'})`).join('\n');
  const prompt = `Вот список кандидатов в нашей базе данных:\n${candidatesData}\n\nПожалуйста, скажи мне имена всех этих кандидатов и пожелай им удачи в поиске работы!`;

  console.log('🤖 ИИ думает над ответом...\n');
  
  // 3. Спрашиваем ИИ
  try {
    const aiReply = await askQwen(prompt);
    console.log('💬 Отвечает ИИ:\n─────────────────────────\n' + aiReply + '\n─────────────────────────');
  } catch (err) {
    console.error('❌ Ошибка ИИ:', err.message);
  }
}

run();
