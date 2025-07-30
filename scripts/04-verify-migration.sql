-- Verify the migration results
SELECT 'Personas' as table_name, count(*) as record_count FROM personas
UNION ALL
SELECT 'Questions' as table_name, count(*) as record_count FROM questions  
UNION ALL
SELECT 'Response Sessions' as table_name, count(*) as record_count FROM response_sessions
UNION ALL
SELECT 'New Responses' as table_name, count(*) as record_count FROM responses_new
UNION ALL
SELECT 'Old Responses' as table_name, count(*) as record_count FROM responses;

-- Verify the migration was successful
SELECT 
  p.title,
  p.id,
  array_length(p.questions, 1) as original_question_count,
  COUNT(pq.id) as migrated_question_count
FROM personas p
LEFT JOIN persona_questions pq ON p.id = pq.persona_id
GROUP BY p.id, p.title, p.questions
ORDER BY p.title;

-- Show sample of migrated data
SELECT 
    p.name as persona_name,
    q.question_order,
    q.question_text,
    count(r.id) as response_count
FROM personas p
JOIN questions q ON p.id = q.persona_id
LEFT JOIN responses_new r ON q.id = r.question_id
GROUP BY p.name, q.question_order, q.question_text
ORDER BY p.name, q.question_order
LIMIT 10;

-- Show sample migrated data
SELECT 
  p.title,
  pq.question_number,
  pq.question_text
FROM personas p
JOIN persona_questions pq ON p.id = pq.persona_id
ORDER BY p.title, pq.question_number
LIMIT 20;

-- Show a sample response session
SELECT 
    rs.respondent_email,
    rs.status,
    rs.completed_at,
    q.question_text,
    r.response_text
FROM response_sessions rs
JOIN responses_new r ON rs.id = r.session_id
JOIN questions q ON r.question_id = q.id
LIMIT 5;
