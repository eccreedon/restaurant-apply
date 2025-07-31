-- Create a simple responses table that will definitely work
CREATE TABLE IF NOT EXISTS responses (
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

-- Test insert to make sure it works
INSERT INTO responses (first_name, last_name, email, persona, questions, answers)
VALUES ('Test', 'User', 'test@example.com', 'Test Persona', '["Test question?"]', '["Test answer"]')
RETURNING id;

-- Clean up test record
DELETE FROM responses WHERE first_name = 'Test' AND last_name = 'User';
