-- Create a trigger to automatically populate the title column in wide_responses
-- when a new record is inserted

-- First, create the trigger function
CREATE OR REPLACE FUNCTION populate_title_from_persona()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the title from the personas table based on persona_id
  SELECT title INTO NEW.title
  FROM personas 
  WHERE id = NEW.persona_id;
  
  -- If no matching persona found, set title to NULL
  IF NEW.title IS NULL THEN
    NEW.title := 'Unknown Persona';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that fires before INSERT on wide_responses
DROP TRIGGER IF EXISTS trigger_populate_title ON wide_responses;
CREATE TRIGGER trigger_populate_title
  BEFORE INSERT ON wide_responses
  FOR EACH ROW
  EXECUTE FUNCTION populate_title_from_persona();

-- Also create a trigger for UPDATE in case persona_id changes
DROP TRIGGER IF EXISTS trigger_update_title ON wide_responses;
CREATE TRIGGER trigger_update_title
  BEFORE UPDATE OF persona_id ON wide_responses
  FOR EACH ROW
  EXECUTE FUNCTION populate_title_from_persona();

-- Test the trigger by updating existing NULL titles
UPDATE wide_responses 
SET title = personas.title
FROM personas 
WHERE wide_responses.persona_id = personas.id
AND wide_responses.title IS NULL;

-- Show results
SELECT 'TRIGGER CREATED SUCCESSFULLY' as status;
SELECT 'Updated existing records:' as info, COUNT(*) as count
FROM wide_responses 
WHERE title IS NOT NULL;
