import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Persona {
  id: string
  title: string
  description: string
  icon: string
  color: string
  questions: any[] // JSONB array
  created_at: string
  updated_at?: string
}

export interface Question {
  id: string
  persona_id: string
  question_text: string
  question_order: number
  question_type: string
  created_at: string
}

export interface ResponseSession {
  id: string
  persona_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  started_at: string
  completed_at?: string
  status: "in_progress" | "completed" | "abandoned"
  analysis?: any
}

export interface IndividualResponse {
  id: string
  session_id: string
  question_id: string
  response_text: string
  created_at: string
}

// Get all personas
export async function getPersonas() {
  const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

  if (error) throw error
  return data as Persona[]
}

// Get questions for a specific persona (from new normalized table)
export async function getQuestionsByPersona(personaId: string) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("persona_id", personaId)
    .order("question_order", { ascending: true })

  if (error) throw error
  return data as Question[]
}

// Create a new response session
export async function createResponseSession(
  personaId: string,
  respondentData: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  },
) {
  const { data, error } = await supabase
    .from("response_sessions")
    .insert({
      persona_id: personaId,
      first_name: respondentData.first_name,
      last_name: respondentData.last_name,
      email: respondentData.email,
      phone: respondentData.phone,
      status: "in_progress",
    })
    .select()
    .single()

  if (error) throw error
  return data as ResponseSession
}

// Save a single response
export async function saveIndividualResponse(sessionId: string, questionId: string, responseText: string) {
  const { data, error } = await supabase
    .from("individual_responses")
    .upsert({
      session_id: sessionId,
      question_id: questionId,
      response_text: responseText,
    })
    .select()
    .single()

  if (error) throw error
  return data as IndividualResponse
}

// Complete a response session
export async function completeResponseSession(sessionId: string, analysis?: any) {
  const { data, error } = await supabase
    .from("response_sessions")
    .update({
      completed_at: new Date().toISOString(),
      status: "completed",
      analysis: analysis,
    })
    .eq("id", sessionId)
    .select()
    .single()

  if (error) throw error
  return data as ResponseSession
}

// Get all responses for a persona (for analysis)
export async function getResponsesByPersona(personaId: string) {
  const { data, error } = await supabase
    .from("response_sessions")
    .select(`
      *,
      individual_responses (
        *,
        questions (
          question_text,
          question_order
        )
      )
    `)
    .eq("persona_id", personaId)
    .eq("status", "completed")

  if (error) throw error
  return data
}
