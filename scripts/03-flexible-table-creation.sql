-- Create new tables that work with whatever ID type you have
DO $$
DECLARE
    persona_id_type text;
    persona_table_name text;
    id_type text;
BEGIN
    -- Determine which persona table exists and what ID type it uses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        persona_table_name := 'personas';
        SELECT data_type INTO id_type
        FROM information_schema.columns 
        WHERE table_name = 'personas' AND column_name = 'id';
        
        RAISE NOTICE 'Existing personas table uses % for ID', id_type;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona') THEN
        persona_table_name := 'persona';
        id_type := 'uuid';
        RAISE NOTICE 'No existing personas table, will use UUID';
    ELSE
        RAISE EXCEPTION 'No persona/personas table found';
    END IF;
    
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
        CASE WHEN id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN id_type = 'uuid' THEN 'gen_random_uuid()' ELSE 'gen_random_uuid()::text' END,
        id_type,
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
        CASE WHEN id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN id_type = 'uuid' THEN 'gen_random_uuid()' ELSE 'gen_random_uuid()::text' END,
        id_type,
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
        CASE WHEN id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN id_type = 'uuid' THEN 'gen_random_uuid()' ELSE 'gen_random_uuid()::text' END,
        CASE WHEN id_type = 'uuid' THEN 'uuid' ELSE 'text' END,
        CASE WHEN id_type = 'uuid' THEN 'uuid' ELSE 'text' END
    );
    
    -- Create persona_questions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'persona_questions') THEN
        IF id_type = 'uuid' THEN
            CREATE TABLE persona_questions (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
                question_text TEXT NOT NULL,
                question_number INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(persona_id, question_number)
            );
        ELSE
            CREATE TABLE persona_questions (
                id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
                persona_id TEXT REFERENCES personas(id) ON DELETE CASCADE,
                question_text TEXT NOT NULL,
                question_number INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(persona_id, question_number)
            );
        END IF;
        
        RAISE NOTICE 'Created persona_questions table with % ID type', id_type;
    ELSE
        RAISE NOTICE 'persona_questions table already exists';
    END IF;
    
    RAISE NOTICE 'Tables created successfully with % ID type', id_type;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_persona_id ON questions(persona_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(persona_id, question_order);
CREATE INDEX IF NOT EXISTS idx_response_sessions_persona ON response_sessions(persona_id);
CREATE INDEX IF NOT EXISTS idx_responses_new_session ON responses_new(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_new_question ON responses_new(question_id);
CREATE INDEX IF NOT EXISTS idx_persona_questions_persona_id ON persona_questions(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_questions_number ON persona_questions(persona_id, question_number);
