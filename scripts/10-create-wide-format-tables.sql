-- Create tables for wide format (one row per respondent, questions as columns)
CREATE TABLE IF NOT EXISTS persona_questions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id text REFERENCES personas(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_number integer NOT NULL, -- Q1, Q2, Q3, etc.
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(persona_id, question_number)
);

CREATE TABLE IF NOT EXISTS wide_responses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id text REFERENCES personas(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  q1_response text,
  q2_response text,
  q3_response text,
  q4_response text,
  q5_response text,
  q6_response text,
  q7_response text,
  q8_response text,
  q9_response text,
  q10_response text,
  analysis jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_persona_questions_persona ON persona_questions(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_questions_number ON persona_questions(persona_id, question_number);
CREATE INDEX IF NOT EXISTS idx_wide_responses_persona ON wide_responses(persona_id);
