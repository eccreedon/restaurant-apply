-- Analyze current database structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('personas', 'responses', 'persona_questions')
ORDER BY table_name, ordinal_position;

-- Check for existing data
SELECT 'personas' as table_name, COUNT(*) as row_count FROM personas
UNION ALL
SELECT 'responses' as table_name, COUNT(*) as row_count FROM responses
UNION ALL
SELECT 'persona_questions' as table_name, COUNT(*) as row_count FROM persona_questions;

-- Check constraints and indexes
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('personas', 'responses', 'persona_questions')
ORDER BY tc.table_name, tc.constraint_type;
