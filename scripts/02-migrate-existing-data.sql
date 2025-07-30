-- Migrate existing data to normalized structure
DO $$
DECLARE
  persona_record RECORD;
  response_record RECORD;
  question_text TEXT;
  answer_text TEXT;
  question_num INTEGER;
  session_id UUID;
  question_id UUID;
BEGIN
  RAISE NOTICE 'Starting data migration to normalized structure...';
  
  -- First, migrate persona questions
  FOR persona_record IN SELECT id, title, questions FROM personas WHERE questions IS NOT NULL LOOP
    question_num := 1;
    
    FOR question_text IN SELECT unnest(persona_record.questions) LOOP
      INSERT INTO persona_questions (persona_id, question_text, question_number)
      VALUES (persona_record.id, question_text, question_num)
      ON CONFLICT (persona_id, question_number) DO NOTHING;
      
      question_num := question_num + 1;
    END LOOP;
  END LOOP;
  
  -- Then, migrate responses
  FOR response_record IN SELECT * FROM responses LOOP
    -- Create response session
    INSERT INTO response_sessions (
      first_name, last_name, email, phone, 
      persona_title, created_at, completed_at
    ) VALUES (
      response_record.first_name,
      response_record.last_name,
      response_record.email,
      response_record.phone,
      response_record.persona,
      response_record.created_at,
      response_record.created_at
    ) RETURNING id INTO session_id;
    
    -- Create individual responses
    question_num := 1;
    FOR question_text IN SELECT jsonb_array_elements_text(response_record.questions) LOOP
      -- Get corresponding answer
      SELECT jsonb_array_elements_text(response_record.answers) INTO answer_text
      FROM (
        SELECT jsonb_array_elements_text(response_record.answers) 
        OFFSET (question_num - 1) LIMIT 1
      ) sub;
      
      -- Find matching question_id
      SELECT pq.id INTO question_id
      FROM persona_questions pq
      JOIN personas p ON pq.persona_id = p.id
      WHERE p.title = response_record.persona 
        AND pq.question_number = question_num;
      
      INSERT INTO individual_responses (
        session_id, question_id, question_text, question_number, answer
      ) VALUES (
        session_id, question_id, question_text, question_num, answer_text
      );
      
      question_num := question_num + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Migration failed: %', SQLERRM;
END $$;
