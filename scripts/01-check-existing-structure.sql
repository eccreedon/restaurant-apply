-- Check the data types of your existing tables
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('persona', 'personas', 'responses')
ORDER BY table_name, ordinal_position;

-- Show sample data to understand the format
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        RAISE NOTICE 'Sample from personas table:';
        PERFORM id, name FROM personas LIMIT 3;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responses') THEN
        RAISE NOTICE 'Sample from responses table:';
        PERFORM persona_id, respondent_email FROM responses LIMIT 3;
    END IF;
END $$;
