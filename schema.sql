-- Unified Database Schema for N84 Platform
-- This schema represents the actual state used by the application code and Supabase.

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. PROFILES TABLE
-- Stores both job seekers (youth) and employers.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE,
    username TEXT,
    full_name TEXT,
    first_name TEXT,
    role TEXT DEFAULT 'youth', -- 'youth' or 'employer'
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code TEXT, -- Code for web login via Telegram bot
    address TEXT, -- Living area/district
    bio TEXT, -- About me / Company description
    company_name TEXT, -- For employers
    bin_iin TEXT, -- For employers (business ID)
    industry TEXT, -- Industry sector
    link TEXT, -- Website or social link
    user_age TEXT, -- Birthday or age (stored as text to match bot input)
    embedding vector(1536), -- AI vector for matching
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
-- Stores job postings created by employers.
CREATE TABLE IF NOT EXISTS public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    salary TEXT,
    area TEXT, -- Location / District
    requirements TEXT,
    employment_type TEXT,
    industry TEXT,
    embedding vector(1536), -- AI vector for matching
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
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
-- Stores responses from job seekers to vacancies.
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
    youth_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    match_score INTEGER, -- AI compatibility score (0-10)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vacancy_id, youth_id) -- Prevent double applications
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
-- Automatically update updated_at timestamp
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
