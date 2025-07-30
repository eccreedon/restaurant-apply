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
