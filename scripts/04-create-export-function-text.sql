-- Create export function compatible with TEXT IDs
CREATE OR REPLACE FUNCTION export_responses_text()
RETURNS TABLE (
  response_id TEXT,
  respondent_name TEXT,
  email TEXT,
  phone TEXT,
  persona TEXT,
  submission_date TIMESTAMP WITH TIME ZONE,
  question_number INTEGER,
  question_text TEXT,
  answer TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as response_id,
    CONCAT(r.first_name, ' ', r.last_name) as respondent_name,
    r.email,
    r.phone,
    r.persona,
    r.created_at as submission_date,
    (row_number() OVER (PARTITION BY r.id ORDER BY q.ordinality))::INTEGER as question_number,
    q.value::TEXT as question_text,
    a.value::TEXT as answer
  FROM responses r
  CROSS JOIN LATERAL jsonb_array_elements(r.questions) WITH ORDINALITY q
  CROSS JOIN LATERAL jsonb_array_elements(r.answers) WITH ORDINALITY a
  WHERE q.ordinality = a.ordinality
  ORDER BY r.created_at DESC, question_number;
END;
$$ LANGUAGE plpgsql;
