import { supabase } from "./supabase"
import { analyzeAnswers, type AnalysisResult } from "./ai-analysis"

export interface ResponseData {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
  analysis?: AnalysisResult
  created_at?: string
}

export async function saveResponse(responseData: ResponseData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Starting to save response for:", responseData.first_name, responseData.last_name)

    // Validate required fields
    if (!responseData.first_name?.trim()) {
      throw new Error("First name is required")
    }
    if (!responseData.last_name?.trim()) {
      throw new Error("Last name is required")
    }
    if (!responseData.email?.trim()) {
      throw new Error("Email is required")
    }
    if (!responseData.persona?.trim()) {
      throw new Error("Persona is required")
    }
    if (!responseData.questions?.length) {
      throw new Error("Questions are required")
    }
    if (!responseData.answers?.length) {
      throw new Error("Answers are required")
    }

    console.log("Validation passed, performing AI analysis...")

    // Get AI analysis
    const analysis = await analyzeAnswers(responseData.questions, responseData.answers, responseData.persona)
    console.log("AI analysis completed:", analysis)

    // Prepare data for database
    const dbData = {
      first_name: responseData.first_name.trim(),
      last_name: responseData.last_name.trim(),
      email: responseData.email.trim(),
      phone: responseData.phone?.trim() || null,
      persona: responseData.persona.trim(),
      questions: responseData.questions,
      answers: responseData.answers,
      analysis: analysis,
      created_at: new Date().toISOString(),
    }

    console.log("Saving to database with data:", dbData)

    // Save to database
    const { data, error } = await supabase.from("responses").insert([dbData]).select()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from database insert")
    }

    console.log("Response saved successfully:", data[0])
    return { success: true }
  } catch (error) {
    console.error("Error saving response:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function getAllResponses(): Promise<ResponseData[]> {
  try {
    console.log("Fetching all responses from database...")

    const { data, error } = await supabase.from("responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      throw error
    }

    console.log(`Fetched ${data?.length || 0} responses`)
    return data || []
  } catch (error) {
    console.error("Error in getAllResponses:", error)
    return []
  }
}
