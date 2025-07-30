-- Fixed verification script
DO $$
DECLARE
  original_count INTEGER;
  migrated_count INTEGER;
  sample_record RECORD;
BEGIN
  -- Count original responses
  SELECT COUNT(*) INTO original_count FROM responses;
  
  -- Count migrated sessions
  SELECT COUNT(*) INTO migrated_count FROM response_sessions;
  
  RAISE NOTICE 'Original responses: %, Migrated sessions: %', original_count, migrated_count;
  
  -- Show sample migrated data with better error handling
  RAISE NOTICE 'Sample migrated data:';
  FOR sample_record IN 
    SELECT 
      rs.first_name,
      rs.last_name,
      rs.persona_title,
      COUNT(ir.id) as response_count
    FROM response_sessions rs
    LEFT JOIN individual_responses ir ON rs.id = ir.session_id
    GROUP BY rs.id, rs.first_name, rs.last_name, rs.persona_title
    LIMIT 5
  LOOP
    RAISE NOTICE 'Name: % %, Persona: %, Responses: %', 
      sample_record.first_name,
      sample_record.last_name,
      sample_record.persona_title,
      sample_record.response_count;
  END LOOP;
  
  -- Check for any orphaned records
  SELECT COUNT(*) INTO original_count
  FROM individual_responses ir
  LEFT JOIN response_sessions rs ON ir.session_id = rs.id
  WHERE rs.id IS NULL;
  
  IF original_count > 0 THEN
    RAISE NOTICE 'WARNING: % orphaned individual responses found', original_count;
  ELSE
    RAISE NOTICE 'No orphaned records found';
  END IF;
  
END $$;
