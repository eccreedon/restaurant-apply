import { supabase } from "./supabase"

export interface PersonaQuestion {
  id: string
  persona_id: string
  question_text: string
  question_number: number
  created_at: string
}

export interface WideResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
  createdAt: string
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
export async function saveWideResponse(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Build the insert object dynamically
    const insertData: any = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      persona: data.persona,
    }

    // Add questions and answers (up to 20 pairs)
    for (let i = 0; i < Math.min(data.questions.length, data.answers.length, 20); i++) {
      insertData[`question_${i + 1}`] = data.questions[i]
      insertData[`answer_${i + 1}`] = data.answers[i]
    }

    const { error } = await supabase.from("wide_responses").insert(insertData)

    if (error) {
      console.error("Error saving wide response:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in saveWideResponse:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get all responses for a persona (perfect for export)
export async function getWideResponsesByPersona(personaId: string) {
  const { data, error } = await supabase
    .from("wide_responses")
    .select("*")
    .eq("persona", personaId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as WideResponse[]
}

// Get all wide responses
export async function getAllWideResponses(): Promise<WideResponse[]> {
  try {
    const { data, error } = await supabase.from("wide_responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching wide responses:", error)
      return []
    }

    return (
      data?.map((row) => {
        // Extract questions and answers from the wide format
        const questions: string[] = []
        const answers: string[] = []

        for (let i = 1; i <= 20; i++) {
          const question = row[`question_${i}`]
          const answer = row[`answer_${i}`]

          if (question && answer) {
            questions.push(question)
            answers.push(answer)
          }
        }

        return {
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          persona: row.persona,
          questions,
          answers,
          createdAt: row.created_at,
        }
      }) || []
    )
  } catch (error) {
    console.error("Error in getAllWideResponses:", error)
    return []
  }
}

// Delete a wide response
export async function deleteWideResponse(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("wide_responses").delete().eq("id", id)

    if (error) {
      console.error("Error deleting wide response:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteWideResponse:", error)
    return false
  }
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

// Export function for CSV/Excel
export async function exportWideResponses(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from("wide_responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error exporting wide responses:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in exportWideResponses:", error)
    return []
  }
}
