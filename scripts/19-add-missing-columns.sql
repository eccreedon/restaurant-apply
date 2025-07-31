-- Add the image column if it doesn't exist
DO $$
BEGIN
  -- Add image column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'image'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE personas ADD COLUMN image TEXT;
    RAISE NOTICE 'Added image column to personas table';
  ELSE
    RAISE NOTICE 'Image column already exists in personas table';
  END IF;

  -- Ensure all required columns exist with proper types
  -- Check if title column exists and is correct type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'title'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE personas ADD COLUMN title TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Added title column to personas table';
  END IF;

  -- Check if description column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'description'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE personas ADD COLUMN description TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Added description column to personas table';
  END IF;

  -- Check if icon column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'icon'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE personas ADD COLUMN icon TEXT NOT NULL DEFAULT '👤';
    RAISE NOTICE 'Added icon column to personas table';
  END IF;

  -- Check if color column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'color'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE personas ADD COLUMN color TEXT NOT NULL DEFAULT '#6B7280';
    RAISE NOTICE 'Added color column to personas table';
  END IF;

  -- Check if questions column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'questions'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE personas ADD COLUMN questions TEXT[];
    RAISE NOTICE 'Added questions column to personas table';
  END IF;

END $$;
