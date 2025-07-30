-- Create tables that match your existing ID format (text instead of uuid)
CREATE TABLE IF NOT EXISTS questions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id text REFERENCES personas(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  question_type text DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS response_sessions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id text REFERENCES personas(id) ON DELETE CASCADE,
  respondent_email text,
  respondent_name text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  status text DEFAULT 'in_progress'
);

CREATE TABLE IF NOT EXISTS responses_new (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text REFERENCES response_sessions(id) ON DELETE CASCADE,
  question_id text REFERENCES questions(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_persona_id') THEN
        CREATE INDEX idx_questions_persona_id ON questions(persona_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_order') THEN
        CREATE INDEX idx_questions_order ON questions(persona_id, question_order);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_response_sessions_persona') THEN
        CREATE INDEX idx_response_sessions_persona ON response_sessions(persona_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_responses_new_session') THEN
        CREATE INDEX idx_responses_new_session ON responses_new(session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_responses_new_question') THEN
        CREATE INDEX idx_responses_new_question ON responses_new(question_id);
    END IF;
END $$;
