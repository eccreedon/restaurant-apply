-- Corrected migration script based on your actual data structure
CREATE OR REPLACE FUNCTION migrate_persona_questionnaire_data_corrected()
RETURNS void AS $$
DECLARE
    persona_record RECORD;
    response_record RECORD;
    session_id text;
    question_id text;
    i integer;
    persona_questions_array text[];
BEGIN
    RAISE NOTICE 'Starting corrected migration of persona questionnaire data...';
    
    -- First, we need to get questions from the responses table since personas.questions is JSONB
    -- but we need to extract the actual question text from responses.questions array
    
    -- Get unique questions for each persona from responses
    FOR response_record IN 
        SELECT DISTINCT persona, questions 
        FROM responses 
        WHERE questions IS NOT NULL 
    LOOP
        RAISE NOTICE 'Processing questions for persona: %', response_record.persona;
        
        -- Insert each question from the array
        FOR i IN 1..array_length(response_record.questions, 1) LOOP
            -- Check if this question already exists for this persona
            IF NOT EXISTS (
                SELECT 1 FROM questions 
                WHERE persona_id = response_record.persona 
                AND question_text = response_record.questions[i]
                AND question_order = i
            ) THEN
                INSERT INTO questions (persona_id, question_text, question_order)
                VALUES (response_record.persona, response_record.questions[i], i);
                
                RAISE NOTICE 'Inserted question %: %', i, left(response_record.questions[i], 80);
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Questions migration completed. Now migrating responses...';
    
    -- Now migrate individual responses
    FOR response_record IN SELECT * FROM responses LOOP
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
            response_record.persona,
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
            WHERE persona_id = response_record.persona 
            AND question_order = i;
            
            -- Insert the individual response
            IF question_id IS NOT NULL AND response_record.answers[i] IS NOT NULL AND trim(response_record.answers[i]) != '' THEN
                INSERT INTO individual_responses (session_id, question_id, response_text)
                VALUES (session_id, question_id, response_record.answers[i]);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Migrated response session for: % % (% answers)', 
                     response_record.first_name, 
                     response_record.last_name,
                     array_length(response_record.answers, 1);
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the corrected migration
SELECT migrate_persona_questionnaire_data_corrected();
