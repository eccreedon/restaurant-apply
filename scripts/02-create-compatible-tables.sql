-- Create tables that match your existing ID format (text instead of uuid)
CREATE TABLE IF NOT EXISTS questions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id text REFERENCES personas(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  question_type text DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS response_sessions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id text REFERENCES personas(id) ON DELETE CASCADE,
  respondent_email text,
  respondent_name text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  status text DEFAULT 'in_progress'
);

CREATE TABLE IF NOT EXISTS responses_new (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text REFERENCES response_sessions(id) ON DELETE CASCADE,
  question_id text REFERENCES questions(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_persona_id') THEN
        CREATE INDEX idx_questions_persona_id ON questions(persona_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_order') THEN
        CREATE INDEX idx_questions_order ON questions(persona_id, question_order);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_response_sessions_persona') THEN
        CREATE INDEX idx_response_sessions_persona ON response_sessions(persona_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_responses_new_session') THEN
        CREATE INDEX idx_responses_new_session ON responses_new(session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_responses_new_question') THEN
        CREATE INDEX idx_responses_new_question ON responses_new(question_id);
    END IF;

    -- Create or modify personas table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'personas') THEN
      CREATE TABLE personas (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        questions TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      RAISE NOTICE 'Created personas table with TEXT id';
    ELSE
      -- Check if id column is UUID or TEXT
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'personas' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
      ) THEN
        RAISE NOTICE 'Personas table exists with UUID id - no changes needed';
      ELSE
        RAISE NOTICE 'Personas table exists with TEXT id - compatible';
      END IF;
    END IF;

    -- Create persona_questions table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'persona_questions') THEN
      CREATE TABLE persona_questions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        persona_id TEXT REFERENCES personas(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(persona_id, question_number)
      );
      RAISE NOTICE 'Created persona_questions table';
    END IF;

    -- Create or modify responses table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responses') THEN
      CREATE TABLE responses (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        persona TEXT NOT NULL,
        questions JSONB NOT NULL,
        answers JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      RAISE NOTICE 'Created responses table with TEXT id';
    END IF;

END $$;
