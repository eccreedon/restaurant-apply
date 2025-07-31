-- First, let's see what we're working with
SELECT 
  id, 
  title, 
  questions,
  pg_typeof(questions) as questions_type
FROM personas 
LIMIT 5;

-- Create a backup of existing data
CREATE TABLE IF NOT EXISTS personas_backup AS 
SELECT * FROM personas;

-- Method 1: Try direct conversion with proper casting
DO $$
DECLARE
  rec RECORD;
  questions_array text[];
BEGIN
  -- Process each row individually to handle conversion safely
  FOR rec IN SELECT id, questions FROM personas WHERE questions IS NOT NULL LOOP
    BEGIN
      -- Convert jsonb array to text array
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(rec.questions)
      ) INTO questions_array;
      
      -- Update the row with converted data
      UPDATE personas 
      SET questions = questions_array 
      WHERE id = rec.id;
      
      RAISE NOTICE 'Converted questions for persona ID: %', rec.id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to convert questions for persona ID: %, Error: %', rec.id, SQLERRM;
    END;
  END LOOP;
  
  -- Now change the column type
  ALTER TABLE personas ALTER COLUMN questions TYPE text[] USING questions::text[];
  
  RAISE NOTICE 'Successfully converted questions column to text[]';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Conversion failed: %', SQLERRM;
END $$;
