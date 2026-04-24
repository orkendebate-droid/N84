const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixDeletion() {
  console.log('⚡ Настройка каскадного удаления для вакансий...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- 1. Удаляем старое ограничение, если оно есть
      ALTER TABLE public.applications 
      DROP CONSTRAINT IF EXISTS applications_vacancy_id_fkey;
      
      -- 2. Добавляем новое с ON DELETE CASCADE
      ALTER TABLE public.applications 
      ADD CONSTRAINT applications_vacancy_id_fkey 
      FOREIGN KEY (vacancy_id) 
      REFERENCES public.vacancies(id) 
      ON DELETE CASCADE;
      
      -- 3. Перегружаем схему
      NOTIFY pgrst, 'reload schema';
    `
  });

  if (error) {
    console.error('❌ Ошибка Supabase:', error);
  } else {
    console.log('✅ Всё готово! Теперь вакансии можно удалять вместе с откликами.');
  }
}

fixDeletion();
