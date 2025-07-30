-- Create normalized tables for the questionnaire system
CREATE TABLE IF NOT EXISTS personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  questions TEXT[], -- Keep for backward compatibility
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS persona_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(persona_id, question_number)
);

CREATE TABLE IF NOT EXISTS response_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  persona_id UUID REFERENCES personas(id),
  persona_title TEXT NOT NULL, -- Denormalized for easier querying
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS individual_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES response_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES persona_questions(id),
  question_text TEXT NOT NULL, -- Denormalized for easier querying
  question_number INTEGER NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persona_questions_persona_id ON persona_questions(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_questions_number ON persona_questions(persona_id, question_number);
CREATE INDEX IF NOT EXISTS idx_response_sessions_persona ON response_sessions(persona_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_email ON response_sessions(email);
CREATE INDEX IF NOT EXISTS idx_individual_responses_session ON individual_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_individual_responses_question ON individual_responses(question_id);
