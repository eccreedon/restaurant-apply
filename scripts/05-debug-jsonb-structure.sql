-- Debug the JSONB structure in responses
DO $$
DECLARE
  sample_record RECORD;
  question_array JSONB;
  answer_array JSONB;
  i INTEGER;
BEGIN
  RAISE NOTICE 'Debugging JSONB structure in responses table...';
  
  -- Get a sample record
  SELECT * INTO sample_record 
  FROM responses 
  LIMIT 1;
  
  IF sample_record IS NULL THEN
    RAISE NOTICE 'No records found in responses table';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Sample record ID: %', sample_record.id;
  RAISE NOTICE 'Persona: %', sample_record.persona;
  
  -- Analyze questions structure
  question_array := sample_record.questions;
  RAISE NOTICE 'Questions type: %', jsonb_typeof(question_array);
  RAISE NOTICE 'Questions length: %', jsonb_array_length(question_array);
  RAISE NOTICE 'First question: %', question_array->0;
  
  -- Analyze answers structure  
  answer_array := sample_record.answers;
  RAISE NOTICE 'Answers type: %', jsonb_typeof(answer_array);
  RAISE NOTICE 'Answers length: %', jsonb_array_length(answer_array);
  RAISE NOTICE 'First answer: %', answer_array->0;
  
  -- Show all questions and answers
  FOR i IN 0..LEAST(jsonb_array_length(question_array)-1, jsonb_array_length(answer_array)-1) LOOP
    RAISE NOTICE 'Q%: % | A%: %', 
      i+1, question_array->i, 
      i+1, answer_array->i;
  END LOOP;
  
END $$;
