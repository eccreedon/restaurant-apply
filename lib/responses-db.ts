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

export async function getAllResponses(): Promise<ResponseData[]> {
  try {
    // First check if wide_responses table exists, if not fall back to responses table
    const { data, error } = await supabase
      .from("wide_responses")
      .select(`
        *,
        personas!wide_responses_persona_id_fkey(title)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching from wide_responses, trying responses table:", error)

      // Fallback to original responses table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("responses")
        .select("*")
        .order("created_at", { ascending: false })

      if (fallbackError) {
        console.error("Error fetching responses:", fallbackError)
        return []
      }

      return (
        fallbackData?.map((row) => ({
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          phone: row.phone,
          persona: row.persona,
          questions: Array.isArray(row.questions) ? row.questions : JSON.parse(row.questions || "[]"),
          answers: Array.isArray(row.answers) ? row.answers : JSON.parse(row.answers || "[]"),
          analysis: row.analysis,
          created_at: row.created_at,
        })) || []
      )
    }

    return (
      data?.map((row) => {
        const questions: string[] = []
        const answers: string[] = []

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
          persona: row.personas?.title || "Unknown",
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
    console.log("Saving response with data:", data)

    // Try to save to wide_responses table first
    try {
      // Get the persona_id from the persona title
      const { data: personaData, error: personaError } = await supabase
        .from("personas")
        .select("id")
        .eq("title", data.persona)
        .single()

      if (personaError || !personaData) {
        console.error("Could not find persona:", data.persona, personaError)
        return { success: false, error: `Could not find persona: ${data.persona}` }
      }

      const insertData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        persona_id: personaData.id,
      }

      // Add questions and answers using the correct column names
      for (let i = 0; i < Math.min(data.questions.length, data.answers.length, 20); i++) {
        insertData[`question_${i + 1}`] = data.questions[i]
        insertData[`q${i + 1}_response`] = data.answers[i]
      }

      console.log("Attempting to save to wide_responses table:", insertData)

      const { error: wideError } = await supabase.from("wide_responses").insert(insertData)

      if (wideError) {
        console.error("Wide_responses table error:", wideError)
        throw wideError
      }

      console.log("Response saved successfully to wide_responses")
      return { success: true }
    } catch (wideError) {
      console.log("Wide_responses failed, falling back to responses table:", wideError)

      // Fallback to original responses table
      const fallbackData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        persona: data.persona,
        questions: JSON.stringify(data.questions),
        answers: JSON.stringify(data.answers),
      }

      const { error: fallbackError } = await supabase.from("responses").insert(fallbackData)

      if (fallbackError) {
        console.error("Fallback to responses table also failed:", fallbackError)
        return { success: false, error: fallbackError.message }
      }

      console.log("Response saved successfully to responses table")
      return { success: true }
    }
  } catch (error) {
    console.error("Error in saveResponse:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteResponse(id: string): Promise<boolean> {
  try {
    // Try wide_responses first, then responses
    let { error } = await supabase.from("wide_responses").delete().eq("id", id)

    if (error) {
      console.log("Trying to delete from responses table instead")
      const result = await supabase.from("responses").delete().eq("id", id)
      error = result.error
    }

    if (error) {
      console.error("Error deleting response:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteResponse:", error)
    return false
  }
}
