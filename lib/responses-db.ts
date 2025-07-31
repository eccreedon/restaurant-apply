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
    console.log("Fetching responses...")

    const { data, error } = await supabase.from("responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      return []
    }

    return (
      data?.map((row) => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        persona: row.persona,
        questions: Array.isArray(row.questions)
          ? row.questions
          : typeof row.questions === "string"
            ? JSON.parse(row.questions)
            : [],
        answers: Array.isArray(row.answers)
          ? row.answers
          : typeof row.answers === "string"
            ? JSON.parse(row.answers)
            : [],
        analysis: row.analysis,
        created_at: row.created_at,
      })) || []
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
    console.log("=== SAVING RESPONSE ===")
    console.log("Input data:", data)

    // Validate input
    if (!data.first_name?.trim()) {
      return { success: false, error: "First name is required" }
    }
    if (!data.last_name?.trim()) {
      return { success: false, error: "Last name is required" }
    }
    if (!data.email?.trim()) {
      return { success: false, error: "Email is required" }
    }
    if (!data.persona?.trim()) {
      return { success: false, error: "Persona is required" }
    }
    if (!data.answers?.length) {
      return { success: false, error: "Answers are required" }
    }

    // Prepare the data exactly as the table expects
    const insertData = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      persona: data.persona.trim(),
      questions: data.questions, // Keep as array - Supabase will handle JSONB conversion
      answers: data.answers, // Keep as array - Supabase will handle JSONB conversion
    }

    console.log("Prepared insert data:", insertData)

    const { data: result, error } = await supabase.from("responses").insert([insertData]).select()

    if (error) {
      console.error("Supabase insert error:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { success: false, error: `Database error: ${error.message}` }
    }

    console.log("Insert successful:", result)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in saveResponse:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function deleteResponse(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("responses").delete().eq("id", id)

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
