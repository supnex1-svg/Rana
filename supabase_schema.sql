-- ========================================================
-- Supabase Schema for Onboarding4U (Rana)
-- انسخ هذا الكود والصقه في SQL Editor داخل لوحة تحكم Supabase
-- ========================================================

-- 1. جدول رسائل صفحة التواصل (Contacts)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    lang TEXT DEFAULT 'ar',
    status TEXT DEFAULT 'new'
);

-- 2. جدول طلبات التوظيف (Applications)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    job TEXT,
    governorate TEXT,
    details JSONB,
    status TEXT DEFAULT 'new'
);

-- 3. جدول تحليلات الزيارات (Analytics)
CREATE TABLE IF NOT EXISTS public.analytics (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT DEFAULT 'pv',
    vid TEXT,
    session_id TEXT,
    path TEXT,
    referrer TEXT,
    device TEXT,
    lang TEXT,
    extra JSONB
);

-- ========================================================
-- تفعيل سياسات الأمان (Row Level Security - RLS)
-- ========================================================

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- السماح لأي زائر بإرسال رسالة تواصل (Insert Only)
CREATE POLICY "Allow public insert to contacts"
    ON public.contacts
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- السماح فقط للمسؤولين بقراءة رسائل التواصل
CREATE POLICY "Allow service/authenticated read contacts"
    ON public.contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- السماح لأي زائر بتقديم طلب توظيف (Insert Only)
CREATE POLICY "Allow public insert to applications"
    ON public.applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- السماح فقط للمسؤولين بقراءة طلبات التوظيف
CREATE POLICY "Allow service/authenticated read applications"
    ON public.applications
    FOR SELECT
    TO authenticated
    USING (true);

-- السماح بتسجيل الزيارات (Insert Only)
CREATE POLICY "Allow public insert to analytics"
    ON public.analytics
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- السماح فقط للمسؤولين بقراءة التحليلات
CREATE POLICY "Allow service/authenticated read analytics"
    ON public.analytics
    FOR SELECT
    TO authenticated
    USING (true);
