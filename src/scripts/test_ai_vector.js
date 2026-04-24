const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAiAndVector() {
  console.log('🧪 ЗАПУСК ТЕСТА AI + VECTOR STORAGE (N84)\n');

  // 1. Проверка доступности Qwen
  console.log('--- Этап 1: Проверка ИИ (Qwen) ---');
  try {
    const aiRes = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.QWEN_MODEL || "qwen-plus",
        messages: [{ role: "user", content: "Привет! Ты работаешь в системе поиска работы N84 для Актау?" }],
        extra_body: { "enable_thinking": false }
      })
    });
    const data = await aiRes.json();
    if (data.choices) {
      console.log('✅ ИИ отвечает корректно:', data.choices[0].message.content.substring(0, 50) + '...');
    } else {
      throw new Error(JSON.stringify(data));
    }
  } catch (err) {
    console.error('❌ Ошибка ИИ (Qwen):', err.message);
  }

  // 2. Проверка Векторной памяти (pgvector)
  console.log('\n--- Этап 2: Проверка Векторной Базы (pgvector) ---');
  try {
    const { data: cols, error: colError } = await supabase.rpc('exec_sql', {
        sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'embedding';"
    });

    if (cols && cols.length > 0) {
      console.log(`✅ Векторная колонка 'embedding' найдена. Тип: ${cols[0].data_type}`);
    } else {
      console.error('❌ Векторная колонка не найдена. Убедитесь, что pgvector установлен.');
    }
  } catch (err) {
    console.error('❌ Ошибка при доступе к вектору:', err.message);
  }

  // 3. Проверка поиска по сходству (SMI)
  console.log('\n--- Этап 3: Имитация семантического поиска ---');
  try {
    // В полноценной системе мы бы вызвали RPC match_vacancies. 
    // Здесь мы просто проверим, есть ли в базе записи с эмбеддингами.
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    if (error) throw error;
    console.log(`📊 Количество профилей с векторными знаниями: ${count || 0}`);
    console.log('💡 Совет: Для работы RAG необходимо запускать генерацию эмбеддингов после регистрации.');
  } catch (err) {
    console.error('❌ Ошибка поиска:', err.message);
  }

  console.log('\n🏁 Тест AI & Vector завершен.');
}

testAiAndVector();
