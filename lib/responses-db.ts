import { supabase } from "./supabase"
import { analyzeResponses } from "./ai-analysis"

export interface ResponseData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
}

export interface SaveResponseResult {
  success: boolean
  error?: string
  id?: string
}

export async function saveResponse(responseData: ResponseData): Promise<SaveResponseResult> {
  try {
    console.log("Saving response to database...", responseData)

    // First, save the response without analysis
    const { data: savedResponse, error: saveError } = await supabase
      .from("responses")
      .insert([
        {
          first_name: responseData.first_name,
          last_name: responseData.last_name,
          email: responseData.email,
          phone: responseData.phone || null,
          persona: responseData.persona,
          questions: responseData.questions,
          answers: responseData.answers,
          analysis: null, // Will be updated after AI analysis
        },
      ])
      .select()
      .single()

    if (saveError) {
      console.error("Database save error:", saveError)
      return {
        success: false,
        error: `Database error: ${saveError.message}`,
      }
    }

    console.log("Response saved successfully:", savedResponse.id)

    // Now perform AI analysis in the background
    try {
      console.log("Starting AI analysis...")
      const analysis = await analyzeResponses(responseData.persona, responseData.questions, responseData.answers)

      if (analysis) {
        console.log("AI analysis completed, updating database...")
        const { error: updateError } = await supabase.from("responses").update({ analysis }).eq("id", savedResponse.id)

        if (updateError) {
          console.error("Error updating analysis:", updateError)
          // Don't fail the entire operation if analysis update fails
        } else {
          console.log("Analysis saved successfully")
        }
      } else {
        console.log("AI analysis failed, but response was saved")
      }
    } catch (analysisError) {
      console.error("AI analysis error:", analysisError)
      // Don't fail the entire operation if analysis fails
    }

    return {
      success: true,
      id: savedResponse.id,
    }
  } catch (error) {
    console.error("Unexpected error in saveResponse:", error)
    return {
      success: false,
      error: "An unexpected error occurred while saving your response.",
    }
  }
}

export async function getAllResponses() {
  try {
    const { data, error } = await supabase.from("responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllResponses:", error)
    return []
  }
}

export async function getResponseById(id: string) {
  try {
    const { data, error } = await supabase.from("responses").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching response:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getResponseById:", error)
    return null
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
