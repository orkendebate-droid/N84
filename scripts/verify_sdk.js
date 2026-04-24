const { createClient } = require('@supabase/supabase-js');
// Явно указываем путь к .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Ошибка: Переменные не загружены. Проверьте .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log('Подключение к ' + supabaseUrl);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (error) {
    console.log('Связь есть! Но таблица profiles не найдена (это нормально, если вы еще не запустили SQL).');
  } else {
    console.log('Ура! Связь установлена, я вижу таблицу профилей.');
  }
}

check().catch(err => {
  console.log('Критическая ошибка:', err.message);
});
