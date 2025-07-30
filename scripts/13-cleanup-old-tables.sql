-- Clean up the old normalized format tables since we're using wide format
DROP TABLE IF EXISTS individual_responses CASCADE;
DROP TABLE IF EXISTS response_sessions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- Also drop any indexes that were created for the old tables
DROP INDEX IF EXISTS idx_questions_persona_id;
DROP INDEX IF EXISTS idx_questions_order;
DROP INDEX IF EXISTS idx_response_sessions_persona;
DROP INDEX IF EXISTS idx_individual_responses_session;
DROP INDEX IF EXISTS idx_individual_responses_question;
DROP INDEX IF EXISTS idx_responses_new_session;
DROP INDEX IF EXISTS idx_responses_new_question;

-- Verify what tables remain
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
