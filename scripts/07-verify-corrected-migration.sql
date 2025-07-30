-- Verify the corrected migration results
SELECT 'Personas' as table_name, count(*) as record_count FROM personas
UNION ALL
SELECT 'Questions' as table_name, count(*) as record_count FROM questions  
UNION ALL
SELECT 'Response Sessions' as table_name, count(*) as record_count FROM response_sessions
UNION ALL
SELECT 'Individual Responses' as table_name, count(*) as record_count FROM individual_responses
UNION ALL
SELECT 'Old Responses' as table_name, count(*) as record_count FROM responses;

-- Show the questions that were extracted
SELECT 
    q.persona_id,
    p.title as persona_title,
    q.question_order,
    left(q.question_text, 100) as question_preview
FROM questions q
JOIN personas p ON q.persona_id = p.id
ORDER BY q.persona_id, q.question_order;

-- Show sample migrated responses
SELECT 
    rs.first_name,
    rs.last_name,
    p.title as persona_title,
    q.question_order,
    left(q.question_text, 60) as question_preview,
    left(ir.response_text, 80) as response_preview
FROM response_sessions rs
JOIN personas p ON rs.persona_id = p.id
JOIN individual_responses ir ON rs.id = ir.session_id
JOIN questions q ON ir.question_id = q.id
ORDER BY rs.started_at DESC, q.question_order
LIMIT 10;
