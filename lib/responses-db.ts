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
    const { data, error } = await supabase.from("wide_responses").select("*").order("created_at", { ascending: false })

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
          const answer = row[`answer_${i}`]

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
          persona: row.persona,
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
    const insertData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      persona: data.persona,
    }

    for (let i = 0; i < Math.min(data.questions.length, data.answers.length, 20); i++) {
      insertData[`question_${i + 1}`] = data.questions[i]
      insertData[`answer_${i + 1}`] = data.answers[i]
    }

    const { error } = await supabase.from("wide_responses").insert(insertData)

    if (error) {
      console.error("Error saving response:", error)
      return { success: false, error: error.message }
    }

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
