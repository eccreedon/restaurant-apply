-- Check if responses table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if table exists at all
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'responses' 
  AND table_schema = 'public'
) as responses_table_exists;

-- Show sample data if any exists
SELECT COUNT(*) as total_responses FROM responses;
