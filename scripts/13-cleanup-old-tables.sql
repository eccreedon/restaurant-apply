-- Optional: Clean up old normalized tables if wide format is preferred
-- WARNING: Only run this after confirming wide format works correctly

-- Uncomment the following lines to drop the normalized tables:
-- DROP TABLE IF EXISTS individual_responses CASCADE;
-- DROP TABLE IF EXISTS response_sessions CASCADE;

-- Keep the original responses table as backup
-- DROP TABLE IF EXISTS responses CASCADE;

-- Update the main personas table to match wide_personas
DO $$
BEGIN
  -- Copy any new personas from wide_personas back to main personas table
  INSERT INTO personas (id, title, description, icon, color, created_at, updated_at)
  SELECT id, title, description, icon, color, created_at, updated_at
  FROM wide_personas
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = EXCLUDED.updated_at;
  
  -- Copy questions back to persona_questions
  INSERT INTO persona_questions (persona_id, question_text, question_number, created_at)
  SELECT persona_id, question_text, question_number, created_at
  FROM wide_persona_questions
  ON CONFLICT (persona_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text;
  
  RAISE NOTICE 'Synchronized personas and questions tables';
END $$;
