const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  console.log('📊 Проверка колонок таблицы vacancies...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vacancies'
      ORDER BY column_name;
    `
  });

  if (error) {
    console.error('❌ Ошибка RPC:', error);
  } else {
    console.log('✅ Колонки в базе:', data);
  }
}

checkColumns();
