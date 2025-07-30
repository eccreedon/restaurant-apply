-- Migrate existing data to wide format
DO $$
DECLARE
  response_record RECORD;
  questions_array JSONB;
  answers_array JSONB;
  questions_length INTEGER;
  answers_length INTEGER;
  insert_columns TEXT[];
  insert_values TEXT[];
  i INTEGER;
  question_text TEXT;
  answer_text TEXT;
  final_query TEXT;
BEGIN
  RAISE NOTICE 'Starting migration to wide format...';
  
  -- First, migrate personas (copy from existing personas table)
  INSERT INTO wide_personas (id, title, description, icon, color, created_at, updated_at)
  SELECT id, title, description, icon, color, created_at, updated_at
  FROM personas
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = EXCLUDED.updated_at;
  
  -- Migrate persona questions
  INSERT INTO wide_persona_questions (persona_id, question_text, question_number, created_at)
  SELECT persona_id, question_text, question_number, created_at
  FROM persona_questions
  ON CONFLICT (persona_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text;
  
  -- Clear existing wide responses
  DELETE FROM wide_responses;
  
  -- Migrate responses to wide format
  FOR response_record IN SELECT * FROM responses LOOP
    -- Initialize arrays for building dynamic query
    insert_columns := ARRAY['first_name', 'last_name', 'email', 'phone', 'persona', 'created_at'];
    insert_values := ARRAY[
      quote_literal(response_record.first_name),
      quote_literal(response_record.last_name), 
      quote_literal(response_record.email),
      COALESCE(quote_literal(response_record.phone), 'NULL'),
      quote_literal(response_record.persona),
      quote_literal(response_record.created_at::TEXT)
    ];
    
    -- Get arrays and their lengths
    questions_array := response_record.questions;
    answers_array := response_record.answers;
    questions_length := jsonb_array_length(questions_array);
    answers_length := jsonb_array_length(answers_array);
    
    -- Add question-answer pairs (up to 20)
    FOR i IN 0..LEAST(questions_length-1, answers_length-1, 19) LOOP
      question_text := questions_array->>i;
      answer_text := answers_array->>i;
      
      IF question_text IS NOT NULL AND answer_text IS NOT NULL THEN
        insert_columns := insert_columns || ARRAY['question_' || (i+1), 'answer_' || (i+1)];
        insert_values := insert_values || ARRAY[quote_literal(question_text), quote_literal(answer_text)];
      END IF;
    END LOOP;
    
    -- Build and execute dynamic insert
    final_query := 'INSERT INTO wide_responses (' || array_to_string(insert_columns, ', ') || 
                   ') VALUES (' || array_to_string(insert_values, ', ') || ')';
    
    EXECUTE final_query;
  END LOOP;
  
  RAISE NOTICE 'Wide format migration completed successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Wide format migration failed: %', SQLERRM;
    RAISE;
END $$;
