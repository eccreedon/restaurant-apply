-- Create the new normalized tables
CREATE TABLE personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  question_type text DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE response_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  respondent_email text,
  respondent_name text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  status text DEFAULT 'in_progress'
);

CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES response_sessions(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_questions_persona_id ON questions(persona_id);
CREATE INDEX idx_questions_order ON questions(persona_id, question_order);
CREATE INDEX idx_response_sessions_persona ON response_sessions(persona_id);
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_question ON responses(question_id);
