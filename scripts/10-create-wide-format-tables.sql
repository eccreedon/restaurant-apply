-- Create wide format tables for easier analysis
CREATE TABLE IF NOT EXISTS wide_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wide_persona_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id UUID REFERENCES wide_personas(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(persona_id, question_number)
);

-- Wide format responses table - one row per respondent
CREATE TABLE IF NOT EXISTS wide_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  persona TEXT NOT NULL,
  
  -- Dynamic columns for questions and answers (up to 20 questions)
  question_1 TEXT,
  answer_1 TEXT,
  question_2 TEXT,
  answer_2 TEXT,
  question_3 TEXT,
  answer_3 TEXT,
  question_4 TEXT,
  answer_4 TEXT,
  question_5 TEXT,
  answer_5 TEXT,
  question_6 TEXT,
  answer_6 TEXT,
  question_7 TEXT,
  answer_7 TEXT,
  question_8 TEXT,
  answer_8 TEXT,
  question_9 TEXT,
  answer_9 TEXT,
  question_10 TEXT,
  answer_10 TEXT,
  question_11 TEXT,
  answer_11 TEXT,
  question_12 TEXT,
  answer_12 TEXT,
  question_13 TEXT,
  answer_13 TEXT,
  question_14 TEXT,
  answer_14 TEXT,
  question_15 TEXT,
  answer_15 TEXT,
  question_16 TEXT,
  answer_16 TEXT,
  question_17 TEXT,
  answer_17 TEXT,
  question_18 TEXT,
  answer_18 TEXT,
  question_19 TEXT,
  answer_19 TEXT,
  question_20 TEXT,
  answer_20 TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wide_responses_persona ON wide_responses(persona);
CREATE INDEX IF NOT EXISTS idx_wide_responses_email ON wide_responses(email);
CREATE INDEX IF NOT EXISTS idx_wide_responses_created_at ON wide_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_wide_persona_questions_persona_id ON wide_persona_questions(persona_id);
