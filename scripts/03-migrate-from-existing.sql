-- First, let's safely populate the personas table if it's empty
INSERT INTO personas (id, name, description, created_at)
SELECT 
    COALESCE(id, gen_random_uuid()),
    name,
    description,
    COALESCE(created_at, now())
FROM (
    -- Try to get from 'persona' table first, then 'personas' if it exists
    SELECT id, name, description, created_at FROM persona
    WHERE NOT EXISTS (SELECT 1 FROM personas WHERE personas.name = persona.name)
    
    UNION ALL
    
    -- If you have data in personas already, we'll skip duplicates
    SELECT id, name, description, created_at FROM personas
    WHERE false -- This won't execute, just for structure
) existing_personas
ON CONFLICT (id) DO NOTHING;

-- Create a function to safely migrate your comma-separated data
CREATE OR REPLACE FUNCTION migrate_questionnaire_data()
RETURNS void AS $$
DECLARE
    response_record RECORD;
    persona_record RECORD;
    questions_text text;
    responses_text text;
    question_array text[];
    response_array text[];
    session_id uuid;
    question_id uuid;
    i integer;
    clean_question text;
    clean_response text;
BEGIN
    RAISE NOTICE 'Starting migration...';
    
    -- First, create questions from existing response data
    FOR response_record IN 
        SELECT DISTINCT persona_id, questions 
        FROM responses 
        WHERE questions IS NOT NULL 
        LIMIT 10 -- Start with a small batch
    LOOP
        RAISE NOTICE 'Processing persona_id: %', response_record.persona_id;
        
        -- Handle different possible formats of questions data
        questions_text := response_record.questions;
        
        -- Remove array brackets if present: {question1,question2} -> question1,question2
        questions_text := trim(both '{}' from questions_text);
        
        -- Split by comma and clean up
        question_array := string_to_array(questions_text, ',');
        
        -- Insert each question for this persona
        FOR i IN 1..array_length(question_array, 1) LOOP
            clean_question := trim(both '"' from trim(question_array[i]));
            
            -- Only insert if question doesn't already exist for this persona
            IF NOT EXISTS (
                SELECT 1 FROM questions 
                WHERE persona_id = response_record.persona_id 
                AND question_text = clean_question
            ) THEN
                INSERT INTO questions (persona_id, question_text, question_order)
                VALUES (response_record.persona_id, clean_question, i);
                
                RAISE NOTICE 'Inserted question %: %', i, clean_question;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Questions migration completed. Now migrating responses...';
    
    -- Now migrate individual responses
    FOR response_record IN 
        SELECT * FROM responses 
        WHERE responses IS NOT NULL 
        LIMIT 10 -- Start with a small batch
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
        
        -- Handle responses data
        responses_text := response_record.responses;
        responses_text := trim(both '{}' from responses_text);
        response_array := string_to_array(responses_text, ',');
        
        -- Insert individual responses
        FOR i IN 1..array_length(response_array, 1) LOOP
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

-- Run the migration (start with a small batch)
SELECT migrate_questionnaire_data();
