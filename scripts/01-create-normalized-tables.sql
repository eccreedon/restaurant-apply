-- Create the new normalized tables based on your actual structure
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
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  status text DEFAULT 'completed',
  analysis jsonb
);

CREATE TABLE IF NOT EXISTS individual_responses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text REFERENCES response_sessions(id) ON DELETE CASCADE,
  question_id text REFERENCES questions(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_persona_id ON questions(persona_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(persona_id, question_order);
CREATE INDEX IF NOT EXISTS idx_response_sessions_persona ON response_sessions(persona_id);
CREATE INDEX IF NOT EXISTS idx_individual_responses_session ON individual_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_individual_responses_question ON individual_responses(question_id);
