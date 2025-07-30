-- Migration script that works with text IDs
CREATE OR REPLACE FUNCTION migrate_questionnaire_data_text_ids()
RETURNS void AS $$
DECLARE
    response_record RECORD;
    questions_text text;
    responses_text text;
    question_array text[];
    response_array text[];
    session_id text;
    question_id text;
    i integer;
    clean_question text;
    clean_response text;
BEGIN
    RAISE NOTICE 'Starting migration with text IDs...';
    
    -- First, create questions from existing response data
    FOR response_record IN 
        SELECT DISTINCT persona_id, questions 
        FROM responses 
        WHERE questions IS NOT NULL 
        LIMIT 5 -- Start small for testing
    LOOP
        RAISE NOTICE 'Processing persona_id: %', response_record.persona_id;
        
        -- Handle the questions data (could be array format or comma-separated)
        questions_text := response_record.questions::text;
        
        -- Remove array brackets and quotes: {"question1","question2"} -> question1,question2
        questions_text := regexp_replace(questions_text, '^[{\[]|[}\]]$', '', 'g');
        questions_text := replace(questions_text, '""', '"'); -- Handle double quotes
        
        -- Split by comma (handling quoted strings)
        SELECT array_agg(trim(both '"' from trim(unnest)))
        INTO question_array
        FROM unnest(string_to_array(questions_text, '","')) unnest;
        
        -- If that didn't work, try simple comma split
        IF question_array IS NULL OR array_length(question_array, 1) = 0 THEN
            question_array := string_to_array(questions_text, ',');
        END IF;
        
        -- Insert each question for this persona
        FOR i IN 1..COALESCE(array_length(question_array, 1), 0) LOOP
            clean_question := trim(both '"' from trim(question_array[i]));
            
            -- Skip empty questions
            IF length(trim(clean_question)) > 0 THEN
                -- Only insert if question doesn't already exist for this persona
                IF NOT EXISTS (
                    SELECT 1 FROM questions 
                    WHERE persona_id = response_record.persona_id 
                    AND question_text = clean_question
                ) THEN
                    INSERT INTO questions (persona_id, question_text, question_order)
                    VALUES (response_record.persona_id, clean_question, i);
                    
                    RAISE NOTICE 'Inserted question %: %', i, left(clean_question, 50);
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Questions migration completed. Now migrating responses...';
    
    -- Now migrate individual responses
    FOR response_record IN 
        SELECT * FROM responses 
        WHERE responses IS NOT NULL 
        LIMIT 5 -- Start small for testing
    LOOP
        -- Create a response session
        INSERT INTO response_sessions (persona_id, respondent_email, started_at, completed_at, status)
        VALUES (
            response_record.persona_id, 
            response_record.respondent_email, 
            COALESCE(response_record.created_at, now()), 
            COALESCE(response_record.created_at, now()), 
            'completed'
        )
        RETURNING id INTO session_id;
        
        -- Handle responses data similar to questions
        responses_text := response_record.responses::text;
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
            
            -- Get the corresponding question_id
            SELECT id INTO question_id 
            FROM questions 
            WHERE persona_id = response_record.persona_id 
            AND question_order = i;
            
            -- Insert the response if we have both question and non-empty response
            IF question_id IS NOT NULL AND length(trim(clean_response)) > 0 THEN
                INSERT INTO responses_new (session_id, question_id, response_text)
                VALUES (session_id, question_id, clean_response);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Migrated responses for session: %', session_id;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_questionnaire_data_text_ids();
