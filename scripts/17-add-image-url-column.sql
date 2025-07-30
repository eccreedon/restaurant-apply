-- The existing image column can store either base64 data or URLs
-- No schema changes needed, but we could add a comment for clarity
COMMENT ON COLUMN personas.image IS 'Can store base64 data URL or blob storage URL';

-- Verify the column exists
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND column_name = 'image';
