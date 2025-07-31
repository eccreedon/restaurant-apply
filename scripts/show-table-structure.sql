-- Show the actual table structures and data
-- WIDE_RESPONSES TABLE STRUCTURE
SELECT 'WIDE_RESPONSES COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wide_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PERSONAS TABLE STRUCTURE  
SELECT 'PERSONAS COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- SAMPLE DATA FROM WIDE_RESPONSES
SELECT 'WIDE_RESPONSES SAMPLE DATA:' as info;
SELECT id, persona_id, title, first_name, last_name, created_at
FROM wide_responses 
ORDER BY created_at DESC 
LIMIT 3;

-- SAMPLE DATA FROM PERSONAS
SELECT 'PERSONAS SAMPLE DATA:' as info;
SELECT id, title
FROM personas 
ORDER BY created_at DESC
LIMIT 5;

-- CHECK FOREIGN KEY CONSTRAINTS
SELECT 'FOREIGN KEY CONSTRAINTS:' as info;
SELECT 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'wide_responses';
