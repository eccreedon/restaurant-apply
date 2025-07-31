-- Verify all column types in personas table
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data to verify structure
SELECT id, title, questions, image FROM personas LIMIT 3;

-- Test that we can insert with the correct format
DO $$
DECLARE
  test_id uuid;
BEGIN
  INSERT INTO personas (title, description, icon, color, questions)
  VALUES ('Test Persona 2', 'Test Description', '👤', '#6B7280', ARRAY['Question 1', 'Question 2'])
  RETURNING id INTO test_id;
  
  RAISE NOTICE 'Successfully inserted test persona with ID: %', test_id;
  
  -- Clean up
  DELETE FROM personas WHERE id = test_id;
  RAISE NOTICE 'Test persona cleaned up';
END $$;
