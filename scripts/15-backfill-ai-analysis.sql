-- Script to identify responses that need AI analysis
SELECT 
    id,
    first_name,
    last_name,
    persona_id,
    created_at,
    CASE 
        WHEN analysis IS NULL THEN 'No Analysis'
        WHEN analysis->>'summary' IS NULL THEN 'Incomplete Analysis'
        ELSE 'Has Analysis'
    END as analysis_status
FROM wide_responses
ORDER BY created_at DESC;

-- Count responses by analysis status
SELECT 
    CASE 
        WHEN analysis IS NULL THEN 'No Analysis'
        WHEN analysis->>'summary' IS NULL THEN 'Incomplete Analysis'
        ELSE 'Has Analysis'
    END as status,
    COUNT(*) as count
FROM wide_responses
GROUP BY 
    CASE 
        WHEN analysis IS NULL THEN 'No Analysis'
        WHEN analysis->>'summary' IS NULL THEN 'Incomplete Analysis'
        ELSE 'Has Analysis'
    END;
