-- Check what tables and columns you currently have
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('persona', 'personas', 'responses', 'response')
ORDER BY table_name, ordinal_position;

-- Check sample data from existing tables to understand the structure
DO $$
BEGIN
    -- Check if old persona table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona') THEN
        RAISE NOTICE 'Found "persona" table';
        -- Show sample data
        PERFORM * FROM persona LIMIT 1;
    END IF;
    
    -- Check if responses table exists  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responses') THEN
        RAISE NOTICE 'Found "responses" table';
        -- Show sample data
        PERFORM * FROM responses LIMIT 1;
    END IF;
END $$;
