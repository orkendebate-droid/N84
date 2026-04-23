-- Таблица вакансий
CREATE TABLE IF NOT EXISTS public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Кафе, Стройка, Магазин и т.д.
    district TEXT, -- Микрорайон Актау
    salary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Таблица откликов
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vacancy_id, applicant_id) -- Нельзя откликаться дважды
);

-- RLS для вакансий
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vacancies are viewable by everyone" ON public.vacancies FOR SELECT USING (true);
CREATE POLICY "Employers can manage own vacancies" ON public.vacancies FOR ALL USING (auth.uid() = employer_id);

-- RLS для откликов
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own applications" ON public.applications FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() IN (SELECT employer_id FROM public.vacancies WHERE id = vacancy_id));
