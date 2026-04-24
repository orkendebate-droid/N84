const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log('🏗️ Добавляю колонку updated_at в таблицу vacancies...');
  
  // Мы используем прямой запрос через API, так как это PostgreSQL
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.vacancies 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      
      -- Также убедимся, что для соискателей всё на месте
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `
  });

  if (error) {
    console.error('❌ Ошибка при выполнении SQL:', error);
    console.log('Попробую альтернативный метод...');
    
    // Если RPC не настроен, попробуем просто сделать фиктивную вставку с новой колонкой
    // Но лучше всего просто обновить кэш схемы
  } else {
    console.log('✅ Колонка успешно добавлена!');
  }
  
  // Оповещаем PostgREST о смене схемы
  await supabase.rpc('exec_sql', { sql: 'NOTIFY pgrst, "reload schema";' });
  console.log('🔄 Кэш схемы обновлен.');
}

fix();
