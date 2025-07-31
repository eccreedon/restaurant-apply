-- Fix the ID column to have proper UUID default generation
DO $$
BEGIN
  -- Check if the id column has a default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'id' 
    AND column_default IS NOT NULL
  ) THEN
    -- Add default UUID generation to id column
    ALTER TABLE personas ALTER COLUMN id SET DEFAULT gen_random_uuid();
    RAISE NOTICE 'Added UUID default to id column';
  ELSE
    RAISE NOTICE 'ID column already has a default value';
  END IF;
  
  -- Ensure the column is properly set as primary key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'personas' 
    AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE personas ADD PRIMARY KEY (id);
    RAISE NOTICE 'Added primary key constraint to id column';
  ELSE
    RAISE NOTICE 'Primary key constraint already exists';
  END IF;
  
END $$;
