const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Не найдены ключи Supabase в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugVacancy() {
  console.log('🔍 Начинаю глубокую диагностику создания вакансии...');

  // 1. Проверяем наличие работодателя в базе
  console.log('\n--- Этап 1: Проверка работодателя ---');
  const { data: employer, error: empError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'employer')
    .limit(1)
    .single();

  if (empError || !employer) {
    console.error('❌ Ошибка: В базе нет ни одного работодателя! Создание вакансии невозможно без employer_id.');
    console.log('💡 Совет: Зайдите на сайт и зарегистрируйтесь как работодатель.');
    return;
  }
  console.log(`✅ Нашел тестового работодателя: ${employer.full_name} (ID: ${employer.id})`);

  // 2. Пробуем вставить запись
  console.log('\n--- Этап 2: Тестовая вставка вакансии ---');
  const testVacancy = {
    title: 'Тестовый Бариста',
    description: 'Описание теста',
    salary: '100 000 ₸',
    area: '14 мкр',
    requirements: 'Тестовые требования',
    employer_id: employer.id,
    industry: 'catering',
    employment_type: 'full_time'
  };

  const { data: created, error: insError } = await supabase
    .from('vacancies')
    .insert(testVacancy)
    .select()
    .single();

  if (insError) {
    console.error('❌ Ошибка базы данных при вставке:');
    console.error(JSON.stringify(insError, null, 2));
    
    if (insError.code === '42703') {
        console.log('💡 Диагноз: В таблице "vacancies" не хватает какой-то колонки.');
    }
    return;
  }
  console.log(`✅ Вакансия успешно создана в БД! (ID: ${created.id})`);

  // 3. Проверяем ИИ-матчинг
  console.log('\n--- Этап 3: Проверка доступности ИИ ---');
  try {
    const aiRes = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.QWEN_API_KEY}`
        },
        body: JSON.stringify({
            model: process.env.QWEN_MODEL || "qwen-plus",
            messages: [{ role: "user", content: "hi" }]
        })
    });
    const aiJson = await aiRes.json();
    if (aiJson.choices) {
        console.log('✅ ИИ (Qwen) отвечает корректно.');
    } else {
        console.error('❌ ИИ прислал странный ответ:', JSON.stringify(aiJson));
    }
  } catch (e) {
    console.error('❌ Ошибка подключения к ИИ:', e.message);
  }

  // 4. Удаляем тестовую вакансию
  await supabase.from('vacancies').delete().eq('id', created.id);
  console.log('\n--- Диагностика завершена! ---');
}

debugVacancy();
