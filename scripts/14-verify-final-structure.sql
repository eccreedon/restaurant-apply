-- Verify the final database structure
DO $$
DECLARE
  table_info RECORD;
  count_info RECORD;
BEGIN
  RAISE NOTICE 'Final Database Structure Verification';
  RAISE NOTICE '====================================';
  
  -- Show all tables and their row counts
  FOR table_info IN 
    SELECT 
      schemaname,
      tablename,
      CASE tablename
        WHEN 'personas' THEN (SELECT COUNT(*) FROM personas)
        WHEN 'persona_questions' THEN (SELECT COUNT(*) FROM persona_questions)
        WHEN 'responses' THEN (SELECT COUNT(*) FROM responses)
        WHEN 'wide_personas' THEN (SELECT COUNT(*) FROM wide_personas)
        WHEN 'wide_persona_questions' THEN (SELECT COUNT(*) FROM wide_persona_questions)
        WHEN 'wide_responses' THEN (SELECT COUNT(*) FROM wide_responses)
        WHEN 'response_sessions' THEN (SELECT COUNT(*) FROM response_sessions)
        WHEN 'individual_responses' THEN (SELECT COUNT(*) FROM individual_responses)
        ELSE 0
      END as row_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('personas', 'persona_questions', 'responses', 'wide_personas', 'wide_persona_questions', 'wide_responses', 'response_sessions', 'individual_responses')
    ORDER BY tablename
  LOOP
    RAISE NOTICE 'Table: % - Rows: %', table_info.tablename, table_info.row_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Recommended Usage:';
  RAISE NOTICE '=================';
  RAISE NOTICE '- Use wide_responses table for main application';
  RAISE NOTICE '- Use wide_personas and wide_persona_questions for persona management';
  RAISE NOTICE '- Keep original tables as backup';
  
END $$;
