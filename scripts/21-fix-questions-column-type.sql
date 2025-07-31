-- Check current column type
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND column_name = 'questions';

-- Fix the questions column type - convert from jsonb to text[]
DO $$
BEGIN
  -- Check if the column is currently jsonb
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'questions' 
    AND data_type = 'jsonb'
  ) THEN
    -- Convert existing jsonb data to text[] format
    UPDATE personas 
    SET questions = (
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(questions)
      )
    )::text[]
    WHERE questions IS NOT NULL;
    
    -- Change column type to text[]
    ALTER TABLE personas ALTER COLUMN questions TYPE text[] USING questions::text[];
    
    RAISE NOTICE 'Converted questions column from jsonb to text[]';
  ELSE
    RAISE NOTICE 'Questions column is already text[] or does not exist';
  END IF;
END $$;

-- Verify the change
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND column_name = 'questions';

-- Test insert with text[] format
INSERT INTO personas (title, description, icon, color, questions)
VALUES ('Test Persona', 'Test Description', '👤', '#6B7280', ARRAY['Test question 1', 'Test question 2'])
RETURNING id, title, questions;

-- Clean up test record
DELETE FROM personas WHERE title = 'Test Persona';
