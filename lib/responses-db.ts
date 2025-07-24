import { supabase } from "./supabase"

export interface Response {
  id: string
  persona_id: string
  respondent_first_name: string
  respondent_last_name: string
  respondent_email: string
  respondent_phone: string
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
    const { data: response, error } = await supabase
      .from("responses")
      .insert({
        persona_id: data.persona_id,
        respondent_first_name: data.respondent_first_name,
        respondent_last_name: data.respondent_last_name,
        respondent_email: data.respondent_email,
        respondent_phone: data.respondent_phone,
        responses: data.responses,
        ai_analysis: data.ai_analysis,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving response:", error)
      return null
    }

    return response
  } catch (error) {
    console.error("Error saving response:", error)
    return null
  }
}

export async function getAllResponses(): Promise<Response[]> {
  try {
    const { data, error } = await supabase.from("responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting responses:", error)
      return []
    }

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
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting responses by persona:", error)
    return []
  }
}
