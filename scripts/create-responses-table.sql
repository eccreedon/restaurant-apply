-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS responses CASCADE;

-- Create responses table
CREATE TABLE responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  persona TEXT NOT NULL,
  questions TEXT[] NOT NULL,
  answers TEXT[] NOT NULL,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_responses_created_at ON responses(created_at DESC);
CREATE INDEX idx_responses_persona ON responses(persona);
CREATE INDEX idx_responses_email ON responses(email);

-- Enable RLS (Row Level Security)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on responses" ON responses
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON responses TO anon;
GRANT ALL ON responses TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
