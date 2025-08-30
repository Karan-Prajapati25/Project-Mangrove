-- Create user profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    country TEXT,
    points INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Investigating', 'Resolved', 'Dismissed')),
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    evidence_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    badge_type TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    earned BOOLEAN DEFAULT false,
    earned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT,
    lessons INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_course_progress table
CREATE TABLE public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    questions INTEGER DEFAULT 0,
    time_limit INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_quiz_scores table
CREATE TABLE public.user_quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create guides table
CREATE TABLE public.guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for reports
CREATE POLICY "Users can view all reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Users can insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for achievements
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.achievements FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for courses (public read)
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Create RLS policies for user course progress
CREATE POLICY "Users can view own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for quizzes (public read)
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);

-- Create RLS policies for user quiz scores
CREATE POLICY "Users can view own scores" ON public.user_quiz_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.user_quiz_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for guides (public read)
CREATE POLICY "Anyone can view guides" ON public.guides FOR SELECT USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, country, points, rank)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
    0,
    (SELECT COUNT(*) + 1 FROM public.profiles)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample data
INSERT INTO public.courses (title, description, difficulty, duration, lessons) VALUES
('Marine Ecosystem Basics', 'Learn about marine ecosystems and their importance', 'Beginner', '2 hours', 8),
('Mangrove Conservation', 'Advanced techniques for mangrove preservation', 'Intermediate', '3 hours', 12),
('Climate Change Impact', 'Understanding climate effects on marine life', 'Advanced', '4 hours', 15);

INSERT INTO public.quizzes (title, description, difficulty, questions, time_limit) VALUES
('Mangrove Identification', 'Test your knowledge of mangrove species', 'Beginner', 10, 15),
('Conservation Strategies', 'Quiz on effective conservation methods', 'Intermediate', 15, 25),
('Marine Biology Advanced', 'Comprehensive marine biology assessment', 'Advanced', 20, 30);

INSERT INTO public.guides (title, description, category, content) VALUES
('Red Mangrove Identification', 'How to identify and document red mangroves', 'Species', 'Red mangroves are easily identified by their distinctive prop roots...'),
('Coral Bleaching Documentation', 'Guide to documenting coral bleaching events', 'Conservation', 'When documenting coral bleaching, look for white or pale corals...'),
('Marine Debris Reporting', 'Best practices for reporting marine debris', 'Pollution', 'When reporting marine debris, include location, type, and estimated quantity...');