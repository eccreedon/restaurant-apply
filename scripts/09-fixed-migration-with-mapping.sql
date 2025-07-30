-- Fixed migration that maps persona titles to IDs
CREATE OR REPLACE FUNCTION migrate_persona_questionnaire_data_fixed()
RETURNS void AS $$
DECLARE
    response_record RECORD;
    session_id text;
    question_id text;
    actual_persona_id text;
    i integer;
BEGIN
    RAISE NOTICE 'Starting fixed migration with persona mapping...';
    
    -- First, create questions by mapping persona titles to IDs
    FOR response_record IN 
        SELECT DISTINCT r.persona, r.questions 
        FROM responses r
        WHERE r.questions IS NOT NULL 
    LOOP
        -- Map persona title to actual persona ID
        SELECT p.id INTO actual_persona_id
        FROM personas p 
        WHERE p.title = response_record.persona OR p.id = response_record.persona;
        
        IF actual_persona_id IS NULL THEN
            RAISE NOTICE 'Could not find persona ID for: %', response_record.persona;
            CONTINUE;
        END IF;
        
        RAISE NOTICE 'Processing questions for persona: % (ID: %)', response_record.persona, actual_persona_id;
        
        -- Insert each question from the array
        FOR i IN 1..array_length(response_record.questions, 1) LOOP
            -- Check if this question already exists for this persona
            IF NOT EXISTS (
                SELECT 1 FROM questions 
                WHERE persona_id = actual_persona_id 
                AND question_text = response_record.questions[i]
                AND question_order = i
            ) THEN
                INSERT INTO questions (persona_id, question_text, question_order)
                VALUES (actual_persona_id, response_record.questions[i], i);
                
                RAISE NOTICE 'Inserted question %: %', i, left(response_record.questions[i], 80);
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Questions migration completed. Now migrating responses...';
    
    -- Now migrate individual responses with proper persona ID mapping
    FOR response_record IN SELECT * FROM responses LOOP
        -- Map persona title to actual persona ID
        SELECT p.id INTO actual_persona_id
        FROM personas p 
        WHERE p.title = response_record.persona OR p.id = response_record.persona;
        
        IF actual_persona_id IS NULL THEN
            RAISE NOTICE 'Skipping response - could not find persona ID for: %', response_record.persona;
            CONTINUE;
        END IF;
        
        -- Create a response session
        INSERT INTO response_sessions (
            persona_id, 
            first_name, 
            last_name, 
            email, 
            phone,
            started_at, 
            completed_at, 
            status,
            analysis
        )
        VALUES (
            actual_persona_id,  -- Use mapped persona ID
            response_record.first_name,
            response_record.last_name,
            response_record.email,
            response_record.phone,
            COALESCE(response_record.created_at, now()),
            COALESCE(response_record.created_at, now()),
            'completed',
            response_record.analysis
        )
        RETURNING id INTO session_id;
        
        -- Insert individual responses
        FOR i IN 1..array_length(response_record.answers, 1) LOOP
            -- Get the corresponding question_id
            SELECT id INTO question_id 
            FROM questions 
            WHERE persona_id = actual_persona_id  -- Use mapped persona ID
            AND question_order = i;
            
            -- Insert the individual response
            IF question_id IS NOT NULL AND response_record.answers[i] IS NOT NULL AND trim(response_record.answers[i]) != '' THEN
                INSERT INTO individual_responses (session_id, question_id, response_text)
                VALUES (session_id, question_id, response_record.answers[i]);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Migrated response session for: % % (persona: %)', 
                     response_record.first_name, 
                     response_record.last_name,
                     response_record.persona;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the fixed migration
SELECT migrate_persona_questionnaire_data_fixed();
