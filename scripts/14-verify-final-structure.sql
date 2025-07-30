-- Verify your final clean database structure
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('personas', 'responses', 'persona_questions', 'wide_responses')
ORDER BY table_name, ordinal_position;

-- Show record counts in your final tables
SELECT 'Original Personas' as table_name, count(*) as record_count FROM personas
UNION ALL
SELECT 'Original Responses' as table_name, count(*) as record_count FROM responses
UNION ALL
SELECT 'New Persona Questions' as table_name, count(*) as record_count FROM persona_questions
UNION ALL
SELECT 'New Wide Responses' as table_name, count(*) as record_count FROM wide_responses;
