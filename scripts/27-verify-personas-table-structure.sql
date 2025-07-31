-- Verify the complete personas table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'personas'
  AND tc.table_schema = 'public';

-- Show current data
SELECT COUNT(*) as total_personas FROM personas;
