-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS responses;

-- Create responses table for storing assessment responses
CREATE TABLE responses (
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

-- Create indexes for faster queries
CREATE INDEX idx_responses_persona_id ON responses(persona_id);
CREATE INDEX idx_responses_created_at ON responses(created_at);
CREATE INDEX idx_responses_email ON responses(respondent_email);

-- Enable RLS (Row Level Security)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on responses" ON responses
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON responses TO anon;
GRANT ALL ON responses TO authenticated;
