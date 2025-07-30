-- Flexible migration that adapts to your actual table structure
CREATE OR REPLACE FUNCTION flexible_migrate_questionnaire_data()
RETURNS void AS $$
DECLARE
    response_record RECORD;
    persona_table_name text;
    questions_column text;
    responses_column text;
    questions_text text;
    responses_text text;
    question_array text[];
    response_array text[];
    session_id text;
    question_id text;
    i integer;
    clean_question text;
    clean_response text;
    query_text text;
BEGIN
    -- Determine persona table name
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        persona_table_name := 'personas';
    ELSE
        persona_table_name := 'persona';
    END IF;
    
    -- Find the questions column (might be 'questions', 'question', etc.)
    SELECT column_name INTO questions_column
    FROM information_schema.columns 
    WHERE table_name = 'responses' 
    AND column_name ILIKE '%question%'
    LIMIT 1;
    
    -- Find the responses column (might be 'responses', 'response', 'answers', etc.)
    SELECT column_name INTO responses_column
    FROM information_schema.columns 
    WHERE table_name = 'responses' 
    AND column_name ILIKE '%response%' OR column_name ILIKE '%answer%'
    AND column_name != questions_column
    LIMIT 1;
    
    RAISE NOTICE 'Using persona table: %, questions column: %, responses column: %', 
                 persona_table_name, questions_column, responses_column;
    
    -- Build dynamic query to get responses data
    query_text := format('SELECT persona_id, %I, %I, created_at FROM responses WHERE %I IS NOT NULL LIMIT 3',
                        questions_column, responses_column, questions_column);
    
    RAISE NOTICE 'Executing query: %', query_text;
    
    -- Process responses
    FOR response_record IN EXECUTE query_text LOOP
        RAISE NOTICE 'Processing persona_id: %', response_record.persona_id;
        
        -- Extract questions
        EXECUTE format('SELECT ($1).%I', questions_column) 
        USING response_record INTO questions_text;
        
        -- Clean up questions text
        questions_text := questions_text::text;
        questions_text := regexp_replace(questions_text, '^[{\[]|[}\]]$', '', 'g');
        questions_text := replace(questions_text, '""', '"');
        
        -- Split questions
        SELECT array_agg(trim(both '"' from trim(unnest)))
        INTO question_array
        FROM unnest(string_to_array(questions_text, '","')) unnest;
        
        IF question_array IS NULL OR array_length(question_array, 1) = 0 THEN
            question_array := string_to_array(questions_text, ',');
        END IF;
        
        -- Insert questions
        FOR i IN 1..COALESCE(array_length(question_array, 1), 0) LOOP
            clean_question := trim(both '"' from trim(question_array[i]));
            
            IF length(trim(clean_question)) > 0 THEN
                INSERT INTO questions (persona_id, question_text, question_order)
                VALUES (response_record.persona_id, clean_question, i)
                ON CONFLICT DO NOTHING;
                
                RAISE NOTICE 'Question %: %', i, left(clean_question, 50);
            END IF;
        END LOOP;
        
        -- Create response session and migrate responses
        INSERT INTO response_sessions (persona_id, started_at, completed_at, status)
        VALUES (response_record.persona_id, response_record.created_at, response_record.created_at, 'completed')
        RETURNING id INTO session_id;
        
        -- Extract and process responses
        EXECUTE format('SELECT ($1).%I', responses_column) 
        USING response_record INTO responses_text;
        
        responses_text := responses_text::text;
        responses_text := regexp_replace(responses_text, '^[{\[]|[}\]]$', '', 'g');
        responses_text := replace(responses_text, '""', '"');
        
        SELECT array_agg(trim(both '"' from trim(unnest)))
        INTO response_array
        FROM unnest(string_to_array(responses_text, '","')) unnest;
        
        IF response_array IS NULL OR array_length(response_array, 1) = 0 THEN
            response_array := string_to_array(responses_text, ',');
        END IF;
        
        -- Insert individual responses
        FOR i IN 1..COALESCE(array_length(response_array, 1), 0) LOOP
            clean_response := trim(both '"' from trim(response_array[i]));
            
            SELECT id INTO question_id 
            FROM questions 
            WHERE persona_id = response_record.persona_id 
            AND question_order = i;
            
            IF question_id IS NOT NULL AND length(trim(clean_response)) > 0 THEN
                INSERT INTO responses_new (session_id, question_id, response_text)
                VALUES (session_id, question_id, clean_response);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Migrated session: %', session_id;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the flexible migration
SELECT flexible_migrate_questionnaire_data();
