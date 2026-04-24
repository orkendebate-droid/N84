const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function initVector() {
  console.log('🏗️ Инициализация векторной памяти (pgvector)...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- 1. Включаем расширение pgvector
      CREATE EXTENSION IF NOT EXISTS vector;

      -- 2. Добавляем колонку эмбеддингов соискателям
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS embedding vector(1536);

      -- 3. Добавляем колонку эмбеддингов вакансиям
      ALTER TABLE public.vacancies 
      ADD COLUMN IF NOT EXISTS embedding vector(1536);

      -- 4. Создаем индексы для быстрого поиска по сходству (IVFFlat)
      -- Примечание: Для пустых таблиц индекс создается быстро
      CREATE INDEX IF NOT EXISTS profiles_embedding_idx ON public.profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      CREATE INDEX IF NOT EXISTS vacancies_embedding_idx ON public.vacancies USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      
      -- Перегружаем схему
      NOTIFY pgrst, 'reload schema';
    `
  });

  if (error) {
    console.error('❌ Ошибка при инициализации векторов:', error);
  } else {
    console.log('✅ Векторная память успешно настроена! Теперь ИИ может запоминать смыслы.');
  }
}

initVector();
