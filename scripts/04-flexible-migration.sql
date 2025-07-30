-- Flexible migration that works with any ID type
DO $$
DECLARE
  persona_record RECORD;
  question_text TEXT;
  question_num INTEGER;
  total_personas INTEGER := 0;
  total_questions INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting flexible migration...';
  
  -- Count total personas to migrate
  SELECT COUNT(*) INTO total_personas 
  FROM personas 
  WHERE questions IS NOT NULL AND array_length(questions, 1) > 0;
  
  RAISE NOTICE 'Found % personas with questions to migrate', total_personas;
  
  -- Migrate persona questions to persona_questions table
  FOR persona_record IN 
    SELECT id, title, questions 
    FROM personas 
    WHERE questions IS NOT NULL AND array_length(questions, 1) > 0
  LOOP
    question_num := 1;
    
    -- Loop through each question in the array
    FOR question_text IN SELECT unnest(persona_record.questions) LOOP
      IF question_text IS NOT NULL AND trim(question_text) != '' THEN
        -- Insert into persona_questions table
        INSERT INTO persona_questions (persona_id, question_text, question_number)
        VALUES (persona_record.id, question_text, question_num)
        ON CONFLICT (persona_id, question_number) DO UPDATE SET
          question_text = EXCLUDED.question_text;
        
        total_questions := total_questions + 1;
        question_num := question_num + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Migration completed: % personas, % questions migrated', total_personas, total_questions;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Migration failed: %', SQLERRM;
    RAISE;
END $$;
