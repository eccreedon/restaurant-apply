-- Show sample data from existing tables
DO $$
DECLARE
  sample_record RECORD;
BEGIN
  -- Show sample personas
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'personas') THEN
    RAISE NOTICE 'SAMPLE PERSONAS DATA:';
    RAISE NOTICE '===================';
    
    FOR sample_record IN 
      SELECT id, title, description, icon, color, 
             CASE 
               WHEN questions IS NOT NULL THEN array_length(questions, 1)
               ELSE 0 
             END as question_count
      FROM personas 
      LIMIT 3
    LOOP
      RAISE NOTICE 'ID: %, Title: %, Questions: %', 
        sample_record.id, 
        sample_record.title, 
        sample_record.question_count;
    END LOOP;
    
    -- Show sample questions array
    FOR sample_record IN 
      SELECT title, questions[1:2] as first_two_questions
      FROM personas 
      WHERE questions IS NOT NULL 
      LIMIT 1
    LOOP
      RAISE NOTICE 'Sample questions for %: %', 
        sample_record.title, 
        sample_record.first_two_questions;
    END LOOP;
  END IF;
  
  -- Show sample responses
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responses') THEN
    RAISE NOTICE '';
    RAISE NOTICE 'SAMPLE RESPONSES DATA:';
    RAISE NOTICE '====================';
    
    FOR sample_record IN 
      SELECT id, first_name, last_name, persona, 
             jsonb_array_length(questions) as question_count,
             jsonb_array_length(answers) as answer_count
      FROM responses 
      LIMIT 3
    LOOP
      RAISE NOTICE 'ID: %, Name: % %, Persona: %, Q: %, A: %', 
        sample_record.id,
        sample_record.first_name,
        sample_record.last_name,
        sample_record.persona,
        sample_record.question_count,
        sample_record.answer_count;
    END LOOP;
  END IF;
  
END $$;
