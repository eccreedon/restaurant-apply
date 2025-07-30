-- Migrate data with TEXT IDs
DO $$
DECLARE
  persona_record RECORD;
  question_text TEXT;
  question_num INTEGER;
BEGIN
  RAISE NOTICE 'Starting migration with TEXT IDs...';
  
  -- Migrate persona questions to persona_questions table
  FOR persona_record IN 
    SELECT id, title, questions 
    FROM personas 
    WHERE questions IS NOT NULL AND array_length(questions, 1) > 0
  LOOP
    question_num := 1;
    RAISE NOTICE 'Processing persona: % (ID: %)', persona_record.title, persona_record.id;
    
    -- Loop through each question in the array
    FOR question_text IN SELECT unnest(persona_record.questions) LOOP
      IF question_text IS NOT NULL AND trim(question_text) != '' THEN
        -- Insert into persona_questions table
        INSERT INTO persona_questions (persona_id, question_text, question_number)
        VALUES (persona_record.id, question_text, question_num)
        ON CONFLICT (persona_id, question_number) DO UPDATE SET
          question_text = EXCLUDED.question_text;
        
        question_num := question_num + 1;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Migrated % questions for %', question_num - 1, persona_record.title;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Migration failed: %', SQLERRM;
    RAISE;
END $$;
