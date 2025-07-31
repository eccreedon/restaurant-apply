-- Check the current schema of the personas table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if image column exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'personas' 
  AND column_name = 'image'
  AND table_schema = 'public'
) as image_column_exists;
