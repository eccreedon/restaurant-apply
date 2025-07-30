-- Create tables only if they don't exist
DO $$ 
BEGIN
  -- Create personas table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'personas') THEN
    CREATE TABLE personas (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      questions TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Created personas table';
  ELSE
    RAISE NOTICE 'Personas table already exists';
  END IF;

  -- Create persona_questions table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'persona_questions') THEN
    CREATE TABLE persona_questions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_number INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(persona_id, question_number)
    );
    RAISE NOTICE 'Created persona_questions table';
  ELSE
    RAISE NOTICE 'Persona_questions table already exists';
  END IF;

  -- Create responses table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responses') THEN
    CREATE TABLE responses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      persona TEXT NOT NULL,
      questions JSONB NOT NULL,
      answers JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Created responses table';
  ELSE
    RAISE NOTICE 'Responses table already exists';
  END IF;

  -- Create response_sessions table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'response_sessions') THEN
    CREATE TABLE response_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
      respondent_email text,
      respondent_name text,
      started_at timestamp with time zone DEFAULT now(),
      completed_at timestamp with time zone,
      status text DEFAULT 'in_progress'
    );
    RAISE NOTICE 'Created response_sessions table';
  ELSE
    RAISE NOTICE 'Response_sessions table already exists';
  END IF;

  -- Create responses_new table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responses_new') THEN
    CREATE TABLE responses_new (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid REFERENCES response_sessions(id) ON DELETE CASCADE,
      question_id uuid REFERENCES persona_questions(id) ON DELETE CASCADE,
      response_text text NOT NULL,
      created_at timestamp with time zone DEFAULT now()
    );
    RAISE NOTICE 'Created responses_new table';
  ELSE
    RAISE NOTICE 'Responses_new table already exists';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating tables: %', SQLERRM;
END $$;

-- Add indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_persona_id') THEN
        CREATE INDEX idx_questions_persona_id ON persona_questions(persona_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_order') THEN
        CREATE INDEX idx_questions_order ON persona_questions(persona_id, question_number);
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
END $$;
