-- Check what columns actually exist in wide_responses table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'wide_responses' 
AND table_schema = 'public'
ORDER BY column_name;

-- Show the complete table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'wide_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the table exists at all
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'wide_responses' 
  AND table_schema = 'public'
) as table_exists;
