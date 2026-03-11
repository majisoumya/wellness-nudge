-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.users
-- Stores user profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    daily_health_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.work_sessions
-- Tracks when a user starts and stops working/studying
CREATE TABLE IF NOT EXISTS public.work_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.break_logs
-- Tracks micro-breaks (stretching, water, eye rest)
CREATE TABLE IF NOT EXISTS public.break_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.work_sessions(id) ON DELETE CASCADE NOT NULL,
    break_type TEXT NOT NULL CHECK (break_type IN ('water', 'stretch', 'eye_rest', 'breathe', 'other')),
    duration_seconds INTEGER DEFAULT 20, -- Default 20 seconds for the 20-20-20 rule
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.notifications
-- Stores nudges sent to the user and their read status
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'suggestion', 'alert')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------
-- Indexes for faster lookups
--------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_id ON public.work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_break_logs_user_id ON public.break_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_break_logs_session_id ON public.break_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

--------------------------------------------------------
-- Row Level Security (RLS)
--------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view their own profile." 
    ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." 
    ON public.users FOR UPDATE USING (auth.uid() = id);

-- Users can read, insert, update their own work sessions
CREATE POLICY "Users can view their own work sessions." 
    ON public.work_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own work sessions." 
    ON public.work_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own work sessions." 
    ON public.work_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Users can read, insert, update their own break logs
CREATE POLICY "Users can view their own break logs." 
    ON public.break_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own break logs." 
    ON public.break_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own break logs." 
    ON public.break_logs FOR UPDATE USING (auth.uid() = user_id);

-- Users can read, insert, update their own notifications
CREATE POLICY "Users can view their own notifications." 
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications." 
    ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications." 
    ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

--------------------------------------------------------
-- Trigger for automatic updated_at column on users table
--------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

--------------------------------------------------------
-- Trigger to automatically create a user profile when they sign up
--------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
