-- Verify the column type after conversion
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND column_name = 'questions';

-- Check the data
SELECT id, title, questions, pg_typeof(questions) as type
FROM personas 
LIMIT 3;

-- Test insert with text[] format
DO $$
DECLARE
  test_id uuid;
BEGIN
  INSERT INTO personas (title, description, icon, color, questions)
  VALUES ('Test Persona Final', 'Test Description', '👤', '#6B7280', ARRAY['Question 1', 'Question 2'])
  RETURNING id INTO test_id;
  
  RAISE NOTICE 'Successfully inserted test persona with ID: %', test_id;
  
  -- Verify the insert
  SELECT questions FROM personas WHERE id = test_id;
  
  -- Clean up
  DELETE FROM personas WHERE id = test_id;
  RAISE NOTICE 'Test completed and cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;
