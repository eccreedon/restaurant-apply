import { supabase, type AssessmentRow, type ResponseRow } from "./supabase"
import type { Assessment, AssessmentResponse, QuestionnaireData } from "@/app/page"

// Convert database row to Assessment
function dbRowToAssessment(row: AssessmentRow & { responses?: ResponseRow[] }): Assessment {
  return {
    id: row.id,
    title: row.title,
    persona: row.persona_id,
    createdAt: row.created_at,
    shareableLink: row.shareable_link,
    responses: row.responses?.map(dbRowToAssessmentResponse) || [],
  }
}

// Convert database row to AssessmentResponse
function dbRowToAssessmentResponse(row: ResponseRow): AssessmentResponse {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    respondentName: row.respondent_name,
    respondentEmail: row.respondent_email,
    completedAt: row.completed_at,
    data: {
      persona: row.persona_id,
      answers: Array.isArray(row.answers) ? row.answers : [],
      aiSummary: row.ai_summary || undefined,
    },
  }
}

// Assessment CRUD operations
export async function createAssessment(title: string, personaId: string): Promise<Assessment | null> {
  try {
    const assessmentId = crypto.randomUUID()
    const shareableLink = `${window.location.origin}/assessment/${assessmentId}`

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        id: assessmentId,
        title,
        persona_id: personaId,
        shareable_link: shareableLink,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating assessment:", error)
      return null
    }

    return dbRowToAssessment(data)
  } catch (error) {
    console.error("Error creating assessment:", error)
    return null
  }
}

export async function loadAssessmentsFromDB(): Promise<Assessment[]> {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select(`
        *,
        responses:assessment_responses(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading assessments:", error)
      return []
    }

    return data.map(dbRowToAssessment)
  } catch (error) {
    console.error("Error loading assessments:", error)
    return []
  }
}

export async function getAssessmentById(assessmentId: string): Promise<Assessment | null> {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select(`
        *,
        responses:assessment_responses(*)
      `)
      .eq("id", assessmentId)
      .single()

    if (error) {
      console.error("Error getting assessment:", error)
      return null
    }

    return dbRowToAssessment(data)
  } catch (error) {
    console.error("Error getting assessment:", error)
    return null
  }
}

export async function deleteAssessmentFromDB(assessmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("assessments").delete().eq("id", assessmentId)

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

// Response operations
export async function saveAssessmentResponse(
  assessmentId: string,
  respondentName: string,
  respondentEmail: string,
  questionnaireData: QuestionnaireData,
): Promise<AssessmentResponse | null> {
  try {
    const responseId = crypto.randomUUID()

    const { data, error } = await supabase
      .from("assessment_responses")
      .insert({
        id: responseId,
        assessment_id: assessmentId,
        respondent_name: respondentName,
        respondent_email: respondentEmail,
        persona_id: questionnaireData.persona,
        answers: questionnaireData.answers,
        ai_summary: questionnaireData.aiSummary,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving assessment response:", error)
      return null
    }

    return dbRowToAssessmentResponse(data)
  } catch (error) {
    console.error("Error saving assessment response:", error)
    return null
  }
}

export async function getResponsesByAssessmentId(assessmentId: string): Promise<AssessmentResponse[]> {
  try {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Error getting responses:", error)
      return []
    }

    return data.map(dbRowToAssessmentResponse)
  } catch (error) {
    console.error("Error getting responses:", error)
    return []
  }
}

export async function getAllResponses(): Promise<AssessmentResponse[]> {
  try {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Error getting all responses:", error)
      return []
    }

    return data.map(dbRowToAssessmentResponse)
  } catch (error) {
    console.error("Error getting all responses:", error)
    return []
  }
}
