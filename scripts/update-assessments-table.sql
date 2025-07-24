-- Update assessments table to remove persona_id requirement
ALTER TABLE assessments 
DROP COLUMN IF EXISTS persona_id;

-- Ensure assessments table has the correct structure
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  respondent_name TEXT NOT NULL,
  respondent_email TEXT NOT NULL,
  responses TEXT[] NOT NULL,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_persona_id ON assessment_responses(persona_id);
