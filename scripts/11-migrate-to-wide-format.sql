-- Migrate to wide format (one row per respondent)
CREATE OR REPLACE FUNCTION migrate_to_wide_format()
RETURNS void AS $$
DECLARE
    response_record RECORD;
    actual_persona_id text;
    i integer;
BEGIN
    RAISE NOTICE 'Starting migration to wide format...';
    
    -- First, create standardized questions for each persona
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
        
        RAISE NOTICE 'Creating questions for persona: % (ID: %)', response_record.persona, actual_persona_id;
        
        -- Insert each question with a number (Q1, Q2, etc.)
        FOR i IN 1..array_length(response_record.questions, 1) LOOP
            INSERT INTO persona_questions (persona_id, question_text, question_number)
            VALUES (actual_persona_id, response_record.questions[i], i)
            ON CONFLICT (persona_id, question_number) DO NOTHING;
            
            RAISE NOTICE 'Q%: %', i, left(response_record.questions[i], 80);
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Questions created. Now migrating responses to wide format...';
    
    -- Now migrate each respondent as one row
    FOR response_record IN SELECT * FROM responses LOOP
        -- Map persona title to actual persona ID
        SELECT p.id INTO actual_persona_id
        FROM personas p 
        WHERE p.title = response_record.persona OR p.id = response_record.persona;
        
        IF actual_persona_id IS NULL THEN
            RAISE NOTICE 'Skipping response - could not find persona ID for: %', response_record.persona;
            CONTINUE;
        END IF;
        
        -- Insert one row per respondent with all their answers as columns
        INSERT INTO wide_responses (
            persona_id,
            first_name,
            last_name,
            email,
            phone,
            q1_response,
            q2_response,
            q3_response,
            q4_response,
            q5_response,
            q6_response,
            q7_response,
            q8_response,
            q9_response,
            q10_response,
            analysis,
            created_at
        )
        VALUES (
            actual_persona_id,
            response_record.first_name,
            response_record.last_name,
            response_record.email,
            response_record.phone,
            CASE WHEN array_length(response_record.answers, 1) >= 1 THEN response_record.answers[1] END,
            CASE WHEN array_length(response_record.answers, 1) >= 2 THEN response_record.answers[2] END,
            CASE WHEN array_length(response_record.answers, 1) >= 3 THEN response_record.answers[3] END,
            CASE WHEN array_length(response_record.answers, 1) >= 4 THEN response_record.answers[4] END,
            CASE WHEN array_length(response_record.answers, 1) >= 5 THEN response_record.answers[5] END,
            CASE WHEN array_length(response_record.answers, 1) >= 6 THEN response_record.answers[6] END,
            CASE WHEN array_length(response_record.answers, 1) >= 7 THEN response_record.answers[7] END,
            CASE WHEN array_length(response_record.answers, 1) >= 8 THEN response_record.answers[8] END,
            CASE WHEN array_length(response_record.answers, 1) >= 9 THEN response_record.answers[9] END,
            CASE WHEN array_length(response_record.answers, 1) >= 10 THEN response_record.answers[10] END,
            response_record.analysis,
            response_record.created_at
        );
        
        RAISE NOTICE 'Migrated: % % (% answers)', 
                     response_record.first_name, 
                     response_record.last_name,
                     array_length(response_record.answers, 1);
    END LOOP;
    
    RAISE NOTICE 'Wide format migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_to_wide_format();
