-- Verify the wide format migration
SELECT 'Persona Questions' as table_name, count(*) as record_count FROM persona_questions
UNION ALL
SELECT 'Wide Responses' as table_name, count(*) as record_count FROM wide_responses
UNION ALL
SELECT 'Old Responses' as table_name, count(*) as record_count FROM responses;

-- Show the questions for each persona
SELECT 
    p.title as persona_title,
    pq.question_number,
    left(pq.question_text, 100) as question_preview
FROM persona_questions pq
JOIN personas p ON pq.persona_id = p.id
ORDER BY p.title, pq.question_number;

-- Show the wide format responses (one row per respondent)
SELECT 
    wr.first_name,
    wr.last_name,
    p.title as persona_title,
    left(wr.q1_response, 50) as q1_preview,
    left(wr.q2_response, 50) as q2_preview,
    left(wr.q3_response, 50) as q3_preview
FROM wide_responses wr
JOIN personas p ON wr.persona_id = p.id
ORDER BY wr.created_at DESC;
