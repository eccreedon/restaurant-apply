-- Migrate your existing data to the normalized structure
CREATE OR REPLACE FUNCTION migrate_persona_questionnaire_data()
RETURNS void AS $$
DECLARE
    persona_record RECORD;
    response_record RECORD;
    question_item jsonb;
    session_id text;
    question_id text;
    i integer;
BEGIN
    RAISE NOTICE 'Starting migration of persona questionnaire data...';
    
    -- First, extract questions from personas table and create individual question records
    FOR persona_record IN SELECT * FROM personas LOOP
        RAISE NOTICE 'Processing persona: % (%)', persona_record.title, persona_record.id;
        
        -- Extract questions from JSONB and create individual question records
        FOR i IN 0..jsonb_array_length(persona_record.questions) - 1 LOOP
            question_item := persona_record.questions->i;
            
            -- Insert question (assuming questions are stored as text in the JSONB array)
            INSERT INTO questions (persona_id, question_text, question_order)
            VALUES (
                persona_record.id, 
                question_item#>>'{text}', -- Adjust this path based on your JSONB structure
                i + 1
            )
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Inserted question %: %', i + 1, left(question_item#>>'{text}', 50);
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Questions migration completed. Now migrating responses...';
    
    -- Now migrate responses
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
            response_record.created_at,
            response_record.created_at,
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
            IF question_id IS NOT NULL AND response_record.answers[i] IS NOT NULL THEN
                INSERT INTO individual_responses (session_id, question_id, response_text)
                VALUES (session_id, question_id, response_record.answers[i]);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Migrated response session for: % %', response_record.first_name, response_record.last_name;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_persona_questionnaire_data();
