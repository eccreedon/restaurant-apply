import { supabase } from "./supabase"

export interface Response {
  id: string
  persona_id: string
  respondent_first_name: string
  respondent_last_name: string
  respondent_email: string
  respondent_phone: string | null
  responses: string[]
  ai_analysis?: string
  created_at: string
}

export async function saveResponse(data: {
  persona_id: string
  respondent_first_name: string
  respondent_last_name: string
  respondent_email: string
  respondent_phone: string
  responses: string[]
  ai_analysis?: string
}): Promise<Response | null> {
  try {
    console.log("Attempting to save response:", data)

    const { data: response, error } = await supabase
      .from("responses")
      .insert({
        persona_id: data.persona_id,
        respondent_first_name: data.respondent_first_name,
        respondent_last_name: data.respondent_last_name,
        respondent_email: data.respondent_email,
        respondent_phone: data.respondent_phone || null,
        responses: data.responses,
        ai_analysis: data.ai_analysis,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error saving response:", error)
      throw error
    }

    console.log("Response saved successfully:", response)
    return response
  } catch (error) {
    console.error("Error saving response:", error)
    throw error
  }
}

export async function getAllResponses(): Promise<Response[]> {
  try {
    console.log("Fetching all responses...")

    const { data, error } = await supabase.from("responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error getting responses:", error)
      throw error
    }

    console.log("Fetched responses:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Error getting responses:", error)
    return []
  }
}

export async function getResponsesByPersona(personaId: string): Promise<Response[]> {
  try {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("persona_id", personaId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting responses by persona:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error getting responses by persona:", error)
    return []
  }
}
