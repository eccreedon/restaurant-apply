-- Check the actual structure of wide_responses table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wide_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data to understand the structure
SELECT * FROM wide_responses LIMIT 1;
