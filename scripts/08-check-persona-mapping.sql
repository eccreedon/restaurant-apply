-- Check what persona IDs actually exist vs what's in responses
SELECT 'Personas table IDs:' as info, id, title FROM personas
UNION ALL
SELECT 'Response persona values:', persona, 'N/A' FROM responses GROUP BY persona;

-- Show the mismatch
SELECT 
    r.persona as response_persona_value,
    p.id as actual_persona_id,
    p.title as persona_title
FROM (SELECT DISTINCT persona FROM responses) r
LEFT JOIN personas p ON r.persona = p.title OR r.persona = p.id;
