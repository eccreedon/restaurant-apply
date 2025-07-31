-- Debug the personas table structure and permissions
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

-- Check if there are any constraints that might be causing issues
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'personas'
  AND tc.table_schema = 'public';

-- Test a simple insert to see if the table works
INSERT INTO personas (title, description, icon, color, questions)
VALUES ('Test Persona', 'Test Description', '👤', '#6B7280', ARRAY['Test question'])
RETURNING *;

-- Clean up the test record
DELETE FROM personas WHERE title = 'Test Persona';
