-- Verify the corrected migration
DO $$
DECLARE
  original_responses INTEGER;
  migrated_sessions INTEGER;
  total_individual_responses INTEGER;
  sample_record RECORD;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO original_responses FROM responses;
  SELECT COUNT(*) INTO migrated_sessions FROM response_sessions;
  SELECT COUNT(*) INTO total_individual_responses FROM individual_responses;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '================';
  RAISE NOTICE 'Original responses: %', original_responses;
  RAISE NOTICE 'Migrated sessions: %', migrated_sessions;
  RAISE NOTICE 'Individual responses: %', total_individual_responses;
  
  -- Show sample data
  RAISE NOTICE '';
  RAISE NOTICE 'Sample migrated data:';
  RAISE NOTICE '====================';
  
  FOR sample_record IN 
    SELECT 
      rs.first_name || ' ' || rs.last_name as name,
      rs.persona_title,
      COUNT(ir.id) as response_count,
      string_agg(ir.question_text, ' | ' ORDER BY ir.question_number) as questions_preview
    FROM response_sessions rs
    LEFT JOIN individual_responses ir ON rs.id = ir.session_id
    GROUP BY rs.id, rs.first_name, rs.last_name, rs.persona_title
    LIMIT 3
  LOOP
    RAISE NOTICE 'Name: %, Persona: %, Responses: %', 
      sample_record.name,
      sample_record.persona_title,
      sample_record.response_count;
    RAISE NOTICE 'Questions preview: %', LEFT(sample_record.questions_preview, 100) || '...';
    RAISE NOTICE '';
  END LOOP;
  
END $$;
