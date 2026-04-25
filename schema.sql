-- Unified Database Schema for N84 Platform
-- Синхронизировано с реальной структурой Supabase (проверено 2026-04-25)

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. PROFILES TABLE
-- Хранит и соискателей (youth) и работодателей (employer)
CREATE TABLE IF NOT EXISTS public.profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id       BIGINT UNIQUE,
    username          TEXT,
    full_name         TEXT,
    first_name        TEXT,
    last_name         TEXT,                    -- есть в реальной БД
    role              TEXT DEFAULT 'youth',    -- 'youth' или 'employer'
    is_verified       BOOLEAN DEFAULT FALSE,
    otp_code          TEXT,                    -- Код для входа через бот
    verification_code TEXT,                    -- Старое поле (устаревшее, но есть в БД)
    address           TEXT,                    -- Район проживания
    birthday          TEXT,                    -- Дата рождения (старое поле)
    user_age          TEXT,                    -- Дата рождения (актуальное поле)
    bio               TEXT,                    -- О себе / Описание компании
    company_name      TEXT,                    -- Для работодателей
    bin_iin           TEXT,                    -- БИН/ИИН (для работодателей)
    industry          TEXT,                    -- Сфера деятельности
    link              TEXT,                    -- Сайт или соцсеть
    embedding         vector(1536),            -- AI-вектор для матчинга
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by own user"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Profiles are updateable by own user"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Service role has full access to profiles"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);

-- 2. VACANCIES TABLE
-- Вакансии, созданные работодателями
CREATE TABLE IF NOT EXISTS public.vacancies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    salary          TEXT,
    area            TEXT,                      -- Адрес / Район (актуальное поле)
    district        TEXT,                      -- Район (старое поле, есть в БД)
    category        TEXT,                      -- Категория (старое поле, есть в БД)
    requirements    TEXT,
    experience      TEXT,                      -- Требуемый опыт (есть в БД)
    employment_type TEXT,
    industry        TEXT,
    embedding       vector(1536),              -- AI-вектор для матчинга
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    is_active       BOOLEAN DEFAULT TRUE
);

-- RLS for Vacancies
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vacancies are viewable by everyone"
ON public.vacancies FOR SELECT
USING (true);

CREATE POLICY "Employers can manage own vacancies"
ON public.vacancies FOR ALL
USING (auth.uid() = employer_id);

CREATE POLICY "Service role has full access to vacancies"
ON public.vacancies FOR ALL
USING (true);

-- 3. APPLICATIONS TABLE
-- Отклики соискателей на вакансии
CREATE TABLE IF NOT EXISTS public.applications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id    UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
    youth_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,  -- актуальное поле
    applicant_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,  -- старое поле (есть в БД)
    status        TEXT DEFAULT 'pending',      -- 'pending', 'accepted', 'rejected'
    match_score   INTEGER,                     -- AI-оценка совместимости (0-10)
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vacancy_id, youth_id)
);

-- RLS for Applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own applications"
ON public.applications FOR SELECT
USING (
    auth.uid() = youth_id OR
    auth.uid() IN (SELECT employer_id FROM public.vacancies WHERE id = vacancy_id)
);

CREATE POLICY "Job seekers can create applications"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = youth_id);

CREATE POLICY "Service role has full access to applications"
ON public.applications FOR ALL
USING (true);

-- Functions and Triggers
-- Автоматически обновляет updated_at при изменении профиля
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
