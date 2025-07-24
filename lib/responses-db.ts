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
    if (!responseData.first_name?.trim() || !responseData.last_name?.trim() || !responseData.email?.trim()) {
      throw new Error("Missing required fields: first_name, last_name, or email")
    }

    if (!responseData.persona || !responseData.questions?.length || !responseData.answers?.length) {
      throw new Error("Missing required fields: persona, questions, or answers")
    }

    console.log("Performing AI analysis...")

    // Get AI analysis
    const analysis = await analyzeAnswers(responseData.questions, responseData.answers, responseData.persona)
    console.log("AI analysis completed:", analysis)

    // Prepare data for database
    const dbData = {
      first_name: responseData.first_name.trim(),
      last_name: responseData.last_name.trim(),
      email: responseData.email.trim(),
      phone: responseData.phone?.trim() || null,
      persona: responseData.persona,
      questions: responseData.questions,
      answers: responseData.answers,
      analysis: analysis,
      created_at: new Date().toISOString(),
    }

    console.log("Saving to database...")

    // Save to database
    const { data, error } = await supabase.from("responses").insert([dbData]).select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    console.log("Response saved successfully:", data)
    return { success: true }
  } catch (error) {
    console.error("Error saving response:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
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
