-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- Profiles
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  target_band NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing prompts
CREATE TABLE writing_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('academic_task1', 'general_task1', 'task2')),
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  image_description TEXT,
  time_limit INTEGER NOT NULL DEFAULT 2400,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing submissions
CREATE TABLE writing_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES writing_prompts(id) NOT NULL,
  response_text TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  time_taken INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing results
CREATE TABLE writing_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES writing_submissions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  task_achievement NUMERIC(2,1) NOT NULL,
  coherence_cohesion NUMERIC(2,1) NOT NULL,
  lexical_resource NUMERIC(2,1) NOT NULL,
  grammatical_range NUMERIC(2,1) NOT NULL,
  overall_band NUMERIC(2,1) NOT NULL,
  task_feedback TEXT NOT NULL,
  coherence_feedback TEXT NOT NULL,
  lexical_feedback TEXT NOT NULL,
  grammar_feedback TEXT NOT NULL,
  task_errors JSONB DEFAULT '[]',
  coherence_errors JSONB DEFAULT '[]',
  lexical_errors JSONB DEFAULT '[]',
  grammar_errors JSONB DEFAULT '[]',
  summary TEXT NOT NULL,
  ai_model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  teacher_score NUMERIC(2,1),
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher','admin'))
);

-- Writing prompts: all authenticated users can read
CREATE POLICY "Authenticated users read prompts" ON writing_prompts FOR SELECT TO authenticated USING (true);

-- Writing submissions
CREATE POLICY "Users read own submissions" ON writing_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own submissions" ON writing_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own submissions" ON writing_submissions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Teachers read all submissions" ON writing_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher','admin'))
);

-- Writing results
CREATE POLICY "Users read own results" ON writing_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM writing_submissions WHERE id = submission_id AND user_id = auth.uid())
);
CREATE POLICY "Users insert results for own submissions" ON writing_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM writing_submissions WHERE id = submission_id AND user_id = auth.uid())
);
CREATE POLICY "Teachers read all results" ON writing_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher','admin'))
);
CREATE POLICY "Teachers update results" ON writing_results FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('teacher','admin'))
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed: writing prompts
INSERT INTO writing_prompts (task_type, title, prompt_text, image_description, time_limit) VALUES
(
  'task2', 'Technology and Social Interaction',
  'Some people believe that modern technology is making people more isolated from society. Others think that modern technology is actually bringing people closer together.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Environmental Responsibility',
  'It is more important for governments to spend money on environmental protection than on other areas such as economic development.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'task2', 'Education and Employment',
  'Many graduates cannot find jobs related to their university qualifications. Some people think that universities should focus more on teaching practical skills for employment rather than purely academic subjects.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
  NULL, 2400
),
(
  'academic_task1', 'Bar Chart: Energy Sources',
  'The chart below shows the percentage of energy generated from different sources in a country in 1990 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Bar chart comparing energy sources in 1990 vs 2020. Coal: 45% → 25%. Oil: 30% → 25%. Natural gas: 15% → 20%. Renewables: 10% → 30%.',
  1200
),
(
  'academic_task1', 'Line Graph: Internet Usage',
  'The graph below shows the percentage of people in three countries who used the internet between 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  'Line graph showing internet usage (%) from 2000-2020. Country A: steady rise from 20% to 85%. Country B: rapid growth from 5% to 70% after 2010. Country C: slow growth from 2% to 35%.',
  1200
),
(
  'general_task1', 'Letter: Complaint to Landlord',
  'You have recently moved into a new rented apartment. There are several problems with the apartment that were not mentioned before you moved in.

Write a letter to your landlord. In your letter:
• Describe the problems you have found
• Explain how these problems are affecting you
• Say what you would like the landlord to do

Write at least 150 words. You do NOT need to write any addresses. Begin your letter as follows: Dear Mr/Mrs [name],',
  NULL, 1200
);
