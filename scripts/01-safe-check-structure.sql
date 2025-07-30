-- Safely check the current database structure
DO $$
DECLARE
  table_exists BOOLEAN;
  column_info RECORD;
BEGIN
  -- Check personas table
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'personas'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE 'PERSONAS TABLE EXISTS';
    RAISE NOTICE '==================';
    
    FOR column_info IN 
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'personas'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
        column_info.column_name, 
        column_info.data_type, 
        column_info.is_nullable, 
        COALESCE(column_info.column_default, 'NULL');
    END LOOP;
    
    RAISE NOTICE 'Row count: %', (SELECT COUNT(*) FROM personas);
  ELSE
    RAISE NOTICE 'PERSONAS TABLE DOES NOT EXIST';
  END IF;
  
  -- Check responses table
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'responses'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '';
    RAISE NOTICE 'RESPONSES TABLE EXISTS';
    RAISE NOTICE '==================';
    
    FOR column_info IN 
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'responses'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
        column_info.column_name, 
        column_info.data_type, 
        column_info.is_nullable, 
        COALESCE(column_info.column_default, 'NULL');
    END LOOP;
    
    RAISE NOTICE 'Row count: %', (SELECT COUNT(*) FROM responses);
  ELSE
    RAISE NOTICE 'RESPONSES TABLE DOES NOT EXIST';
  END IF;
  
END $$;
