-- Create export function for normalized data
CREATE OR REPLACE FUNCTION export_normalized_responses()
RETURNS TABLE (
  session_id UUID,
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
    rs.id as session_id,
    CONCAT(rs.first_name, ' ', rs.last_name) as respondent_name,
    rs.email,
    rs.phone,
    rs.persona_title as persona,
    rs.created_at as submission_date,
    ir.question_number,
    ir.question_text,
    ir.answer
  FROM response_sessions rs
  JOIN individual_responses ir ON rs.id = ir.session_id
  ORDER BY rs.created_at DESC, ir.question_number;
END;
$$ LANGUAGE plpgsql;

-- Create a summary function
CREATE OR REPLACE FUNCTION get_response_summary()
RETURNS TABLE (
  persona TEXT,
  total_responses BIGINT,
  avg_questions_per_response NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.persona_title as persona,
    COUNT(DISTINCT rs.id) as total_responses,
    ROUND(AVG(response_counts.question_count), 2) as avg_questions_per_response
  FROM response_sessions rs
  JOIN (
    SELECT 
      session_id,
      COUNT(*) as question_count
    FROM individual_responses
    GROUP BY session_id
  ) response_counts ON rs.id = response_counts.session_id
  GROUP BY rs.persona_title
  ORDER BY total_responses DESC;
END;
$$ LANGUAGE plpgsql;
