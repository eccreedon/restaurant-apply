import { supabase } from "./supabase"

export interface ResponseData {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
  analysis?: any
  created_at?: string
}

export async function saveResponse(data: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("=== SAVING TO WIDE_RESPONSES TABLE ===")
    console.log("Data received:", data)

    // Get persona_id from persona title
    const { data: personaData, error: personaError } = await supabase
      .from("personas")
      .select("id")
      .eq("title", data.persona)
      .single()

    if (personaError || !personaData) {
      console.error("Could not find persona:", data.persona, personaError)
      return { success: false, error: `Could not find persona: ${data.persona}` }
    }

    // Build insert data for wide_responses table
    const insertData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      persona_id: personaData.id,
    }

    // Add questions and answers to the wide format
    for (let i = 0; i < Math.min(data.questions.length, data.answers.length, 20); i++) {
      insertData[`question_${i + 1}`] = data.questions[i]
      insertData[`q${i + 1}_response`] = data.answers[i]
    }

    console.log("Inserting into wide_responses:", insertData)

    const { data: result, error } = await supabase.from("wide_responses").insert(insertData).select().single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    console.log("SUCCESS! Saved to wide_responses:", result)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getAllResponses(): Promise<ResponseData[]> {
  try {
    const { data, error } = await supabase
      .from("wide_responses")
      .select(`
        *,
        personas!wide_responses_persona_id_fkey(title)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      return []
    }

    return (
      data?.map((row) => {
        const questions: string[] = []
        const answers: string[] = []

        // Extract questions and answers from wide format
        for (let i = 1; i <= 20; i++) {
          const question = row[`question_${i}`]
          const answer = row[`q${i}_response`]

          if (question && answer) {
            questions.push(question)
            answers.push(answer)
          }
        }

        return {
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          phone: row.phone,
          persona: row.personas?.title || row.persona || "Unknown", // Updated line
          questions,
          answers,
          analysis: row.analysis,
          created_at: row.created_at,
        }
      }) || []
    )
  } catch (error) {
    console.error("Error in getAllResponses:", error)
    return []
  }
}

export async function deleteResponse(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("wide_responses").delete().eq("id", id)
    return !error
  } catch (error) {
    console.error("Error deleting response:", error)
    return false
  }
}
