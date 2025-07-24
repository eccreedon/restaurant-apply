import { supabase } from "./supabase"

export interface Assessment {
  id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

export interface AssessmentResponse {
  id: string
  assessment_id: string
  persona_id: string
  respondent_name: string
  respondent_email: string
  responses: string[]
  ai_analysis?: string
  created_at: string
}

export async function createAssessment(data: { title: string; description?: string }): Promise<Assessment | null> {
  try {
    const { data: assessment, error } = await supabase
      .from("assessments")
      .insert({
        title: data.title,
        description: data.description,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating assessment:", error)
      return null
    }

    return assessment
  } catch (error) {
    console.error("Error creating assessment:", error)
    return null
  }
}

export async function getAssessment(id: string): Promise<Assessment | null> {
  try {
    const { data, error } = await supabase.from("assessments").select("*").eq("id", id).single()

    if (error) {
      console.error("Error getting assessment:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting assessment:", error)
    return null
  }
}

export async function getAllAssessments(): Promise<Assessment[]> {
  try {
    const { data, error } = await supabase.from("assessments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting assessments:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting assessments:", error)
    return []
  }
}

export async function deleteAssessment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("assessments").delete().eq("id", id)

    if (error) {
      console.error("Error deleting assessment:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting assessment:", error)
    return false
  }
}

export async function saveAssessmentResponse(data: {
  assessment_id: string
  persona_id: string
  respondent_name: string
  respondent_email: string
  responses: string[]
  ai_analysis?: string
}): Promise<AssessmentResponse | null> {
  try {
    const { data: response, error } = await supabase.from("assessment_responses").insert(data).select().single()

    if (error) {
      console.error("Error saving assessment response:", error)
      return null
    }

    return response
  } catch (error) {
    console.error("Error saving assessment response:", error)
    return null
  }
}

export async function getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
  try {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting assessment responses:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting assessment responses:", error)
    return []
  }
}
