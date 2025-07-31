-- Alternative approach: Create new column and migrate data
DO $$
BEGIN
  -- Add a new column with the correct type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'questions_new'
  ) THEN
    ALTER TABLE personas ADD COLUMN questions_new text[];
    RAISE NOTICE 'Added questions_new column';
  END IF;
  
  -- Convert data from jsonb to text[] in the new column
  UPDATE personas 
  SET questions_new = (
    CASE 
      WHEN questions IS NULL THEN NULL
      WHEN jsonb_typeof(questions) = 'array' THEN 
        ARRAY(SELECT jsonb_array_elements_text(questions))
      ELSE 
        ARRAY[questions::text]
    END
  );
  
  -- Drop the old column and rename the new one
  ALTER TABLE personas DROP COLUMN questions;
  ALTER TABLE personas RENAME COLUMN questions_new TO questions;
  
  RAISE NOTICE 'Successfully migrated questions column';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Migration failed: %', SQLERRM;
END $$;
