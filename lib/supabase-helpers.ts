import { supabase } from "./supabase"

export interface NormalizedResponse {
  sessionId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  personaTitle: string
  createdAt: string
  responses: {
    questionId: string
    questionText: string
    questionNumber: number
    answer: string
  }[]
}

export async function getAllNormalizedResponses(): Promise<NormalizedResponse[]> {
  try {
    // Get all response sessions with their individual responses
    const { data: sessions, error: sessionsError } = await supabase
      .from("response_sessions")
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        persona_title,
        created_at,
        individual_responses (
          question_id,
          question_text,
          question_number,
          answer
        )
      `)
      .order("created_at", { ascending: false })

    if (sessionsError) {
      console.error("Error fetching normalized responses:", sessionsError)
      return []
    }

    return (
      sessions?.map((session) => ({
        sessionId: session.id,
        firstName: session.first_name,
        lastName: session.last_name,
        email: session.email,
        phone: session.phone,
        personaTitle: session.persona_title,
        createdAt: session.created_at,
        responses: session.individual_responses.sort((a, b) => a.question_number - b.question_number),
      })) || []
    )
  } catch (error) {
    console.error("Error in getAllNormalizedResponses:", error)
    return []
  }
}

export async function saveNormalizedResponse(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  personaId: string
  personaTitle: string
  responses: { questionId: string; questionText: string; questionNumber: number; answer: string }[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Create response session
    const { data: session, error: sessionError } = await supabase
      .from("response_sessions")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        persona_id: data.personaId,
        persona_title: data.personaTitle,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Error creating response session:", sessionError)
      return { success: false, error: sessionError.message }
    }

    // Create individual responses
    const individualResponses = data.responses.map((response) => ({
      session_id: session.id,
      question_id: response.questionId,
      question_text: response.questionText,
      question_number: response.questionNumber,
      answer: response.answer,
    }))

    const { error: responsesError } = await supabase.from("individual_responses").insert(individualResponses)

    if (responsesError) {
      console.error("Error creating individual responses:", responsesError)
      return { success: false, error: responsesError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in saveNormalizedResponse:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
