-- Check what tables and columns currently exist
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN ('personas', 'responses', 'persona_questions')
ORDER BY t.table_name, c.ordinal_position;

-- Check for any existing data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'personas') THEN
    RAISE NOTICE 'Personas table exists with % rows', (SELECT COUNT(*) FROM personas);
  ELSE
    RAISE NOTICE 'Personas table does not exist';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responses') THEN
    RAISE NOTICE 'Responses table exists with % rows', (SELECT COUNT(*) FROM responses);
  ELSE
    RAISE NOTICE 'Responses table does not exist';
  END IF;
END $$;
