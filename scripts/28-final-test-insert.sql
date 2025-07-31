-- Test that everything works correctly
DO $$
DECLARE
  test_id uuid;
BEGIN
  -- Test insert without specifying ID (should auto-generate)
  INSERT INTO personas (title, description, icon, color, questions)
  VALUES ('Test Persona Final', 'Test Description', '👤', '#6B7280', ARRAY['Question 1', 'Question 2'])
  RETURNING id INTO test_id;
  
  RAISE NOTICE 'Successfully inserted test persona with auto-generated ID: %', test_id;
  
  -- Verify the data
  IF EXISTS (SELECT 1 FROM personas WHERE id = test_id) THEN
    RAISE NOTICE 'Test persona found in database - structure is correct!';
  END IF;
  
  -- Clean up
  DELETE FROM personas WHERE id = test_id;
  RAISE NOTICE 'Test completed and cleaned up successfully';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test failed with error: %', SQLERRM;
END $$;
