import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface PersonaQuestion {
  id: string
  persona_id: string
  question_text: string
  question_number: number
  created_at: string
}

export interface WideResponse {
  id: string
  persona_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  q1_response?: string
  q2_response?: string
  q3_response?: string
  q4_response?: string
  q5_response?: string
  q6_response?: string
  q7_response?: string
  q8_response?: string
  q9_response?: string
  q10_response?: string
  analysis?: any
  created_at: string
}

// Get questions for a persona (numbered Q1, Q2, etc.)
export async function getPersonaQuestions(personaId: string) {
  const { data, error } = await supabase
    .from("persona_questions")
    .select("*")
    .eq("persona_id", personaId)
    .order("question_number", { ascending: true })

  if (error) throw error
  return data as PersonaQuestion[]
}

// Save a complete response (one row per respondent)
export async function saveWideResponse(
  personaId: string,
  respondentData: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  },
  answers: string[], // Array of answers in order
  analysis?: any,
) {
  // Build the response object with Q1-Q10 columns
  const responseData: any = {
    persona_id: personaId,
    first_name: respondentData.first_name,
    last_name: respondentData.last_name,
    email: respondentData.email,
    phone: respondentData.phone,
    analysis: analysis,
  }

  // Add answers to Q1-Q10 columns
  for (let i = 0; i < Math.min(answers.length, 10); i++) {
    responseData[`q${i + 1}_response`] = answers[i]
  }

  const { data, error } = await supabase.from("wide_responses").insert(responseData).select().single()

  if (error) throw error
  return data as WideResponse
}

// Get all responses for a persona (perfect for export)
export async function getWideResponsesByPersona(personaId: string) {
  const { data, error } = await supabase
    .from("wide_responses")
    .select("*")
    .eq("persona_id", personaId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as WideResponse[]
}

// Export function - get responses with question headers
export async function exportPersonaResponses(personaId: string) {
  const [questions, responses] = await Promise.all([
    getPersonaQuestions(personaId),
    getWideResponsesByPersona(personaId),
  ])

  return {
    questions,
    responses,
    headers: [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      ...questions.map((q) => `Q${q.question_number}: ${q.question_text}`),
      "Created At",
    ],
  }
}
