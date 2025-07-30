-- Create export function for your actual structure
CREATE OR REPLACE FUNCTION get_responses_pivot(persona_id_param text)
RETURNS TABLE (
  first_name text,
  last_name text,
  email text,
  phone text,
  completed_at timestamp with time zone,
  responses jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.first_name,
    rs.last_name,
    rs.email,
    rs.phone,
    rs.completed_at,
    jsonb_object_agg(
      CONCAT('Q', q.question_order, ': ', q.question_text),
      ir.response_text
    ) as responses
  FROM response_sessions rs
  JOIN individual_responses ir ON rs.id = ir.session_id  
  JOIN questions q ON ir.question_id = q.id
  WHERE rs.persona_id = persona_id_param
    AND rs.status = 'completed'
  GROUP BY rs.id, rs.first_name, rs.last_name, rs.email, rs.phone, rs.completed_at
  ORDER BY rs.completed_at DESC;
END;
$$ LANGUAGE plpgsql;
