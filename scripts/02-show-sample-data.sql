-- Show sample data from existing tables (safely)
DO $$
DECLARE
    col_names text;
    query_text text;
BEGIN
    -- For personas table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        -- Get first 3 column names
        SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) 
        INTO col_names
        FROM (
            SELECT column_name, ordinal_position 
            FROM information_schema.columns 
            WHERE table_name = 'personas' 
            ORDER BY ordinal_position 
            LIMIT 3
        ) sub;
        
        query_text := 'SELECT ' || col_names || ' FROM personas LIMIT 3';
        RAISE NOTICE 'Sample from personas table:';
        RAISE NOTICE 'Query: %', query_text;
        -- Execute the dynamic query (results will show in logs)
        EXECUTE query_text;
    END IF;
    
    -- For responses table  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'responses') THEN
        SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) 
        INTO col_names
        FROM (
            SELECT column_name, ordinal_position 
            FROM information_schema.columns 
            WHERE table_name = 'responses' 
            ORDER BY ordinal_position 
            LIMIT 5
        ) sub;
        
        query_text := 'SELECT ' || col_names || ' FROM responses LIMIT 2';
        RAISE NOTICE 'Sample from responses table:';
        RAISE NOTICE 'Query: %', query_text;
        EXECUTE query_text;
    END IF;
END $$;
