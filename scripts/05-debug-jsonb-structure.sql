-- Let's see what your actual JSONB questions structure looks like
SELECT 
    id,
    title,
    questions,
    jsonb_typeof(questions) as questions_type,
    jsonb_array_length(questions) as questions_count
FROM personas 
LIMIT 2;

-- Show the first question from each persona to understand the structure
SELECT 
    id,
    title,
    questions->0 as first_question,
    jsonb_typeof(questions->0) as first_question_type
FROM personas 
WHERE jsonb_array_length(questions) > 0;

-- Also check your responses structure
SELECT 
    id,
    persona,
    questions[1] as first_question,
    answers[1] as first_answer,
    array_length(questions, 1) as question_count,
    array_length(answers, 1) as answer_count
FROM responses 
LIMIT 2;
