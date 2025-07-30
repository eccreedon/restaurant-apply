-- Add image column to personas table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS image TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND column_name = 'image';
