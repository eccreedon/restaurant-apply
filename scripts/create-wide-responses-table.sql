-- Create the wide_responses table with the correct structure
CREATE TABLE IF NOT EXISTS wide_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  persona_id UUID REFERENCES personas(id),
  
  -- Questions (up to 20)
  question_1 TEXT,
  question_2 TEXT,
  question_3 TEXT,
  question_4 TEXT,
  question_5 TEXT,
  question_6 TEXT,
  question_7 TEXT,
  question_8 TEXT,
  question_9 TEXT,
  question_10 TEXT,
  question_11 TEXT,
  question_12 TEXT,
  question_13 TEXT,
  question_14 TEXT,
  question_15 TEXT,
  question_16 TEXT,
  question_17 TEXT,
  question_18 TEXT,
  question_19 TEXT,
  question_20 TEXT,
  
  -- Responses (up to 20)
  q1_response TEXT,
  q2_response TEXT,
  q3_response TEXT,
  q4_response TEXT,
  q5_response TEXT,
  q6_response TEXT,
  q7_response TEXT,
  q8_response TEXT,
  q9_response TEXT,
  q10_response TEXT,
  q11_response TEXT,
  q12_response TEXT,
  q13_response TEXT,
  q14_response TEXT,
  q15_response TEXT,
  q16_response TEXT,
  q17_response TEXT,
  q18_response TEXT,
  q19_response TEXT,
  q20_response TEXT,
  
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wide_responses_persona_id ON wide_responses(persona_id);
CREATE INDEX IF NOT EXISTS idx_wide_responses_email ON wide_responses(email);
CREATE INDEX IF NOT EXISTS idx_wide_responses_created_at ON wide_responses(created_at);
