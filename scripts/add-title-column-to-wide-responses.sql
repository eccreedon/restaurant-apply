-- Add title column to wide_responses table and populate it
DO $$
BEGIN
  -- Add the title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wide_responses' 
    AND column_name = 'title'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE wide_responses ADD COLUMN title TEXT;
    RAISE NOTICE 'Added title column to wide_responses table';
  ELSE
    RAISE NOTICE 'Title column already exists in wide_responses table';
  END IF;

  -- Populate the title column with data from personas table
  UPDATE wide_responses 
  SET title = personas.title
  FROM personas 
  WHERE wide_responses.persona_id = personas.id
  AND wide_responses.title IS NULL;

  RAISE NOTICE 'Populated title column with persona titles';

  -- Show the results
  RAISE NOTICE 'Updated % rows', (SELECT COUNT(*) FROM wide_responses WHERE title IS NOT NULL);

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Verify the results
SELECT 
  id,
  first_name,
  last_name,
  persona_id,
  title,
  created_at
FROM wide_responses 
ORDER BY created_at DESC 
LIMIT 5;
