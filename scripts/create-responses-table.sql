-- Create responses table for storing assessment responses
CREATE TABLE IF NOT EXISTS responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id TEXT NOT NULL,
  respondent_first_name TEXT NOT NULL,
  respondent_last_name TEXT NOT NULL,
  respondent_email TEXT NOT NULL,
  respondent_phone TEXT,
  responses TEXT[] NOT NULL,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_responses_persona_id ON responses(persona_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on responses" ON responses
  FOR ALL USING (true);
