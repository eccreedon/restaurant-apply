-- Create new tables that work with whatever ID type you have
DO $$
DECLARE
    persona_id_type text;
    persona_table_name text;
BEGIN
    -- Determine which persona table exists and what ID type it uses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        persona_table_name := 'personas';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona') THEN
        persona_table_name := 'persona';
    ELSE
        RAISE EXCEPTION 'No persona/personas table found';
    END IF;
    
    -- Get the ID column data type
    SELECT data_type INTO persona_id_type
    FROM information_schema.columns 
    WHERE table_name = persona_table_name AND column_name = 'id';
    
    RAISE NOTICE 'Found table: %, ID type: %', persona_table_name, persona_id_type;
    
    -- Create questions table with matching ID type
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS questions (
            id %s PRIMARY KEY DEFAULT %s,
            persona_id %s REFERENCES %s(id) ON DELETE CASCADE,
            question_text text NOT NULL,
            question_order integer NOT NULL,
            question_type text DEFAULT ''text'',
            created_at timestamp with time zone DEFAULT now()
        )',
        CASE WHEN persona_id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN persona_id_type = 'uuid' THEN 'gen_random_uuid()' ELSE 'gen_random_uuid()::text' END,
        persona_id_type,
        persona_table_name
    );
    
    -- Create response_sessions table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS response_sessions (
            id %s PRIMARY KEY DEFAULT %s,
            persona_id %s REFERENCES %s(id) ON DELETE CASCADE,
            respondent_email text,
            respondent_name text,
            started_at timestamp with time zone DEFAULT now(),
            completed_at timestamp with time zone,
            status text DEFAULT ''in_progress''
        )',
        CASE WHEN persona_id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN persona_id_type = 'uuid' THEN 'gen_random_uuid()' ELSE 'gen_random_uuid()::text' END,
        persona_id_type,
        persona_table_name
    );
    
    -- Create responses_new table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS responses_new (
            id %s PRIMARY KEY DEFAULT %s,
            session_id %s REFERENCES response_sessions(id) ON DELETE CASCADE,
            question_id %s REFERENCES questions(id) ON DELETE CASCADE,
            response_text text NOT NULL,
            created_at timestamp with time zone DEFAULT now()
        )',
        CASE WHEN persona_id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN persona_id_type = 'uuid' THEN 'gen_random_uuid()' ELSE 'gen_random_uuid()::text' END,
        CASE WHEN persona_id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN persona_id_type = 'uuid' THEN 'uuid' ELSE 'text' END
    );
    
    RAISE NOTICE 'Tables created successfully with % ID type', persona_id_type;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_persona_id ON questions(persona_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(persona_id, question_order);
CREATE INDEX IF NOT EXISTS idx_response_sessions_persona ON response_sessions(persona_id);
CREATE INDEX IF NOT EXISTS idx_responses_new_session ON responses_new(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_new_question ON responses_new(question_id);
