-- Script to identify responses that need AI analysis

-- Add analysis column to wide_responses table for AI analysis
ALTER TABLE wide_responses ADD COLUMN IF NOT EXISTS analysis JSONB;

-- Create index for analysis queries
CREATE INDEX IF NOT EXISTS idx_wide_responses_analysis ON wide_responses USING GIN (analysis);

-- Update existing responses to have null analysis (will be filled by backfill process)
UPDATE wide_responses SET analysis = NULL WHERE analysis IS NULL;

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
