-- Show ALL columns in wide_responses table with their exact names and types
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wide_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;
