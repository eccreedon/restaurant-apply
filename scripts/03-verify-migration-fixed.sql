-- Verify the migration results (fixed)
SELECT 'Personas' as table_name, count(*) as record_count FROM personas
UNION ALL
SELECT 'Questions' as table_name, count(*) as record_count FROM questions  
UNION ALL
SELECT 'Response Sessions' as table_name, count(*) as record_count FROM response_sessions
UNION ALL
SELECT 'Individual Responses' as table_name, count(*) as record_count FROM individual_responses
UNION ALL
SELECT 'Old Responses' as table_name, count(*) as record_count FROM responses;

-- Show sample of migrated data
SELECT 
    p.title as persona_title,
    q.question_order,
    q.question_text,
    count(ir.id) as response_count
FROM personas p
JOIN questions q ON p.id = q.persona_id
LEFT JOIN individual_responses ir ON q.id = ir.question_id
GROUP BY p.title, q.question_order, q.question_text
ORDER BY p.title, q.question_order
LIMIT 10;

-- Show a sample response session (fixed column reference)
SELECT 
    rs.first_name,
    rs.last_name,
    rs.email,
    p.title as persona_title,
    q.question_text,
    ir.response_text
FROM response_sessions rs
JOIN personas p ON rs.persona_id = p.id
JOIN individual_responses ir ON rs.id = ir.session_id
JOIN questions q ON ir.question_id = q.id
ORDER BY rs.started_at DESC, q.question_order  -- Fixed: using started_at instead of created_at
LIMIT 10;
