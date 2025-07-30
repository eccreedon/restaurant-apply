-- Verify wide format migration
DO $$
DECLARE
  original_count INTEGER;
  wide_count INTEGER;
  sample_record RECORD;
  persona_count INTEGER;
  question_count INTEGER;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO original_count FROM responses;
  SELECT COUNT(*) INTO wide_count FROM wide_responses;
  SELECT COUNT(*) INTO persona_count FROM wide_personas;
  SELECT COUNT(*) INTO question_count FROM wide_persona_questions;
  
  RAISE NOTICE 'Wide Format Migration Summary:';
  RAISE NOTICE '=============================';
  RAISE NOTICE 'Original responses: %', original_count;
  RAISE NOTICE 'Wide format responses: %', wide_count;
  RAISE NOTICE 'Wide format personas: %', persona_count;
  RAISE NOTICE 'Wide format questions: %', question_count;
  
  -- Show sample wide format data
  RAISE NOTICE '';
  RAISE NOTICE 'Sample wide format data:';
  RAISE NOTICE '=======================';
  
  FOR sample_record IN 
    SELECT 
      first_name || ' ' || last_name as name,
      persona,
      CASE WHEN question_1 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN question_2 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN question_3 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN question_4 IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN question_5 IS NOT NULL THEN 1 ELSE 0 END as question_count,
      LEFT(answer_1, 50) as first_answer_preview
    FROM wide_responses
    LIMIT 3
  LOOP
    RAISE NOTICE 'Name: %, Persona: %, Questions: %', 
      sample_record.name,
      sample_record.persona,
      sample_record.question_count;
    RAISE NOTICE 'First answer preview: %...', sample_record.first_answer_preview;
    RAISE NOTICE '';
  END LOOP;
  
  -- Check for any data integrity issues
  SELECT COUNT(*) INTO original_count
  FROM wide_responses 
  WHERE question_1 IS NULL;
  
  IF original_count > 0 THEN
    RAISE NOTICE 'WARNING: % responses have no questions', original_count;
  ELSE
    RAISE NOTICE 'All responses have at least one question';
  END IF;
  
END $$;
