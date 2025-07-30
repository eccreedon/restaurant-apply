-- Check persona mapping between old and new structure
DO $$
DECLARE
  persona_record RECORD;
  mapping_record RECORD;
BEGIN
  RAISE NOTICE 'Checking persona mapping...';
  RAISE NOTICE '==========================';
  
  -- Show all personas and their question counts
  FOR persona_record IN 
    SELECT 
      p.id,
      p.title,
      array_length(p.questions, 1) as original_questions,
      COUNT(pq.id) as migrated_questions
    FROM personas p
    LEFT JOIN persona_questions pq ON p.id = pq.persona_id
    GROUP BY p.id, p.title, p.questions
    ORDER BY p.title
  LOOP
    RAISE NOTICE 'Persona: % (ID: %)', persona_record.title, persona_record.id;
    RAISE NOTICE '  Original questions: %, Migrated questions: %', 
      COALESCE(persona_record.original_questions, 0),
      persona_record.migrated_questions;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Response persona mapping:';
  RAISE NOTICE '========================';
  
  -- Check how response personas map to actual personas
  FOR mapping_record IN
    SELECT 
      r.persona as response_persona,
      COUNT(*) as response_count,
      CASE 
        WHEN EXISTS (SELECT 1 FROM personas p WHERE p.title = r.persona) 
        THEN 'MAPPED' 
        ELSE 'UNMAPPED' 
      END as mapping_status
    FROM responses r
    GROUP BY r.persona
    ORDER BY response_count DESC
  LOOP
    RAISE NOTICE 'Response persona: "%" - % responses - %', 
      mapping_record.response_persona,
      mapping_record.response_count,
      mapping_record.mapping_status;
  END LOOP;
  
END $$;
