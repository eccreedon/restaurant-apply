-- Create export function that works with text IDs
CREATE OR REPLACE FUNCTION get_responses_pivot(persona_id_param text)
RETURNS TABLE (
  respondent_name text,
  respondent_email text,
  completed_at timestamp with time zone,
  responses jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.respondent_name,
    rs.respondent_email,
    rs.completed_at,
    jsonb_object_agg(
      CONCAT('Q', q.question_order, ': ', q.question_text),
      r.response_text
    ) as responses
  FROM response_sessions rs
  JOIN responses_new r ON rs.id = r.session_id  
  JOIN questions q ON r.question_id = q.id
  WHERE rs.persona_id = persona_id_param
    AND rs.status = 'completed'
  GROUP BY rs.id, rs.respondent_name, rs.respondent_email, rs.completed_at
  ORDER BY rs.completed_at DESC;
END;
$$ LANGUAGE plpgsql;
