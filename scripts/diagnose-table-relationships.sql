-- Diagnostic script to understand the exact table structure and relationships
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '=== WIDE_RESPONSES TABLE STRUCTURE ===';
  FOR rec IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'wide_responses' 
    AND table_schema = 'public'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
      rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== PERSONAS TABLE STRUCTURE ===';
  FOR rec IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND table_schema = 'public'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
      rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== SAMPLE DATA FROM WIDE_RESPONSES ===';
  FOR rec IN 
    SELECT id, persona_id, title, first_name, last_name
    FROM wide_responses 
    ORDER BY created_at DESC 
    LIMIT 3
  LOOP
    RAISE NOTICE 'ID: %, Persona_ID: %, Title: %, Name: % %', 
      rec.id, rec.persona_id, COALESCE(rec.title, 'NULL'), rec.first_name, rec.last_name;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== SAMPLE DATA FROM PERSONAS ===';
  FOR rec IN 
    SELECT id, title
    FROM personas 
    LIMIT 5
  LOOP
    RAISE NOTICE 'Persona ID: %, Title: %', rec.id, rec.title;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FOREIGN KEY CONSTRAINTS ===';
  FOR rec IN
    SELECT 
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'wide_responses'
  LOOP
    RAISE NOTICE 'FK: % -> %.%', rec.column_name, rec.foreign_table_name, rec.foreign_column_name;
  END LOOP;

END $$;
