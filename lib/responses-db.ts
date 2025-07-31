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
    // Join with personas table to get persona title
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

    // First, get the persona_id from the persona title
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
      persona_id: personaData.id, // Use persona_id instead of persona
    }

    // Add questions and answers using the correct column names
    for (let i = 0; i < Math.min(data.questions.length, data.answers.length, 20); i++) {
      insertData[`question_${i + 1}`] = data.questions[i]
      insertData[`q${i + 1}_response`] = data.answers[i]
    }

    console.log("Insert data prepared:", insertData)

    const { error } = await supabase.from("wide_responses").insert(insertData)

    if (error) {
      console.error("Supabase error saving response:", error)
      return { success: false, error: error.message }
    }

    console.log("Response saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error in saveResponse:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteResponse(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("wide_responses").delete().eq("id", id)

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
