-- Corrected migration script
DO $$
DECLARE
  response_record RECORD;
  session_id UUID;
  question_text TEXT;
  answer_text TEXT;
  i INTEGER;
  questions_array JSONB;
  answers_array JSONB;
  questions_length INTEGER;
  answers_length INTEGER;
BEGIN
  RAISE NOTICE 'Starting corrected migration...';
  
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
    
    -- Get arrays and their lengths
    questions_array := response_record.questions;
    answers_array := response_record.answers;
    questions_length := jsonb_array_length(questions_array);
    answers_length := jsonb_array_length(answers_array);
    
    -- Process each question-answer pair
    FOR i IN 0..LEAST(questions_length-1, answers_length-1) LOOP
      question_text := questions_array->>i;
      answer_text := answers_array->>i;
      
      -- Skip if either is null or empty
      IF question_text IS NOT NULL AND answer_text IS NOT NULL 
         AND trim(question_text) != '' AND trim(answer_text) != '' THEN
        
        INSERT INTO individual_responses (
          session_id, question_text, question_number, answer
        ) VALUES (
          session_id, question_text, i+1, answer_text
        );
      END IF;
    END LOOP;
    
  END LOOP;
  
  RAISE NOTICE 'Corrected migration completed';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Migration failed: %', SQLERRM;
    RAISE;
END $$;
