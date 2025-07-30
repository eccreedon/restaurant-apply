-- Verify the normalized migration
SELECT 
  'Original responses' as source,
  COUNT(*) as count
FROM responses
UNION ALL
SELECT 
  'Migrated sessions' as source,
  COUNT(*) as count
FROM response_sessions
UNION ALL
SELECT 
  'Individual responses' as source,
  COUNT(*) as count
FROM individual_responses;

-- Show sample migrated data
SELECT 
  rs.first_name,
  rs.last_name,
  rs.persona_title,
  COUNT(ir.id) as response_count
FROM response_sessions rs
LEFT JOIN individual_responses ir ON rs.id = ir.session_id
GROUP BY rs.id, rs.first_name, rs.last_name, rs.persona_title
LIMIT 5;
