-- Move the title column to be between persona_id and first_name
-- Using the CORRECT column names from the actual table structure
DO $$
BEGIN
  -- First, let's check what columns actually exist
  RAISE NOTICE 'Current columns in wide_responses table:';
  
  -- Create a new table with the desired column order using CORRECT column names
  CREATE TABLE wide_responses_temp AS
  SELECT 
    id,
    persona_id,
    title,
    first_name,
    last_name,
    email,
    phone,
    q1_response,
    q2_response,
    q3_response,
    q4_response,
    q5_response,
    q6_response,
    q7_response,
    q8_response,
    q9_response,
    q10_response,
    q11_response,
    q12_response,
    q13_response,
    q14_response,
    q15_response,
    q16_response,
    q17_response,
    q18_response,
    q19_response,
    q20_response,
    analysis,
    created_at
  FROM wide_responses;

  -- Drop the original table
  DROP TABLE wide_responses;

  -- Rename the temp table to the original name
  ALTER TABLE wide_responses_temp RENAME TO wide_responses;

  -- Recreate the primary key constraint
  ALTER TABLE wide_responses ADD PRIMARY KEY (id);

  -- Recreate the foreign key constraint
  ALTER TABLE wide_responses ADD CONSTRAINT wide_responses_persona_id_fkey 
    FOREIGN KEY (persona_id) REFERENCES personas(id);

  -- Recreate indexes
  CREATE INDEX IF NOT EXISTS idx_wide_responses_persona_id ON wide_responses(persona_id);
  CREATE INDEX IF NOT EXISTS idx_wide_responses_email ON wide_responses(email);
  CREATE INDEX IF NOT EXISTS idx_wide_responses_created_at ON wide_responses(created_at);

  -- Set default value for id column
  ALTER TABLE wide_responses ALTER COLUMN id SET DEFAULT gen_random_uuid();

  -- Set default value for created_at column
  ALTER TABLE wide_responses ALTER COLUMN created_at SET DEFAULT NOW();

  RAISE NOTICE 'Successfully reordered columns - title is now between persona_id and first_name';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error reordering columns: %', SQLERRM;
    RAISE;
END $$;

-- Verify the new column order
SELECT column_name, ordinal_position
FROM information_schema.columns 
WHERE table_name = 'wide_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
