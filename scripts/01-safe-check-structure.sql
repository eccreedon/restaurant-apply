-- Safely check the structure of your existing tables
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('persona', 'personas', 'responses', 'response')
ORDER BY table_name, ordinal_position;

-- Show actual table names that exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%persona%' OR table_name LIKE '%response%'
ORDER BY table_name;

-- Count records in existing tables
DO $$
DECLARE
    table_exists boolean;
    record_count integer;
BEGIN
    -- Check personas table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'personas'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'SELECT count(*) FROM personas' INTO record_count;
        RAISE NOTICE 'personas table exists with % records', record_count;
    ELSE
        RAISE NOTICE 'personas table does not exist';
    END IF;
    
    -- Check persona table (singular)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'persona'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'SELECT count(*) FROM persona' INTO record_count;
        RAISE NOTICE 'persona table exists with % records', record_count;
    ELSE
        RAISE NOTICE 'persona table does not exist';
    END IF;
    
    -- Check responses table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'responses'
    ) INTO table_exists;
    
    IF table_exists THEN
        EXECUTE 'SELECT count(*) FROM responses' INTO record_count;
        RAISE NOTICE 'responses table exists with % records', record_count;
    ELSE
        RAISE NOTICE 'responses table does not exist';
    END IF;
END $$;
