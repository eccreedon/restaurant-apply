import { supabase } from "./supabase"
import { analyzeAnswers } from "./ai-analysis"

export interface ResponseData {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  persona: string
  questions: string[] // Keep for compatibility with existing code
  answers: string[] // Keep for compatibility with existing code
  analysis?: any
  created_at?: string
}

export interface WideResponseData {
  id?: string
  persona_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  q1_response?: string
  q2_response?: string
  q3_response?: string
  q4_response?: string
  q5_response?: string
  q6_response?: string
  q7_response?: string
  q8_response?: string
  q9_response?: string
  q10_response?: string
  analysis?: any
  created_at?: string
}

export interface SaveResponseResult {
  success: boolean
  error?: string
  data?: ResponseData
  analysis?: any
}

export async function saveResponse(responseData: Omit<ResponseData, "id" | "created_at">): Promise<SaveResponseResult> {
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
    if (!responseData.answers?.length) {
      throw new Error("Answers are required")
    }

    console.log("Validation passed, performing AI analysis...")

    // Get AI analysis
    let analysis = null
    try {
      analysis = await analyzeAnswers(responseData.questions, responseData.answers, responseData.persona)
      console.log("AI analysis completed:", analysis)
    } catch (error) {
      console.error("AI analysis failed:", error)
      // Continue without analysis
    }

    // Map persona title to persona ID
    const { data: personaData, error: personaError } = await supabase
      .from("personas")
      .select("id")
      .eq("title", responseData.persona)
      .single()

    if (personaError || !personaData) {
      throw new Error(`Could not find persona: ${responseData.persona}`)
    }

    // Prepare data for wide format database
    const wideResponseData: Omit<WideResponseData, "id" | "created_at"> = {
      persona_id: personaData.id,
      first_name: responseData.first_name.trim(),
      last_name: responseData.last_name.trim(),
      email: responseData.email.trim(),
      phone: responseData.phone?.trim() || null,
      analysis: analysis,
    }

    // Add answers to Q1-Q10 columns
    for (let i = 0; i < Math.min(responseData.answers.length, 10); i++) {
      const columnName = `q${i + 1}_response` as keyof WideResponseData
      ;(wideResponseData as any)[columnName] = responseData.answers[i]
    }

    console.log("Saving to wide_responses table with data:", wideResponseData)

    // Save to wide_responses table
    const { data, error } = await supabase.from("wide_responses").insert([wideResponseData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error("No data returned from database insert")
    }

    console.log("Response saved successfully:", data)

    // Convert back to original format for compatibility
    const compatibleData: ResponseData = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      persona: responseData.persona, // Keep original persona title
      questions: responseData.questions,
      answers: responseData.answers,
      analysis: data.analysis,
      created_at: data.created_at,
    }

    return {
      success: true,
      data: compatibleData,
      analysis: analysis,
    }
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
    console.log("Fetching all responses from wide_responses table...")

    const { data, error } = await supabase
      .from("wide_responses")
      .select(`
        *,
        personas (
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      throw error
    }

    console.log(`Fetched ${data?.length || 0} responses`)

    // Convert wide format back to original format for compatibility
    const compatibleResponses: ResponseData[] = (data || []).map((response) => {
      // Collect answers from Q1-Q10 columns
      const answers: string[] = []
      for (let i = 1; i <= 10; i++) {
        const answer = (response as any)[`q${i}_response`]
        if (answer) {
          answers.push(answer)
        }
      }

      return {
        id: response.id,
        first_name: response.first_name,
        last_name: response.last_name,
        email: response.email,
        phone: response.phone,
        persona: (response as any).personas?.title || "Unknown",
        questions: [], // Would need to fetch from persona_questions if needed
        answers: answers,
        analysis: response.analysis,
        created_at: response.created_at,
      }
    })

    return compatibleResponses
  } catch (error) {
    console.error("Error in getAllResponses:", error)
    return []
  }
}

export async function getResponseById(id: string): Promise<ResponseData | null> {
  try {
    console.log("Fetching response from wide_responses table:", id)

    const { data, error } = await supabase
      .from("wide_responses")
      .select(`
        *,
        personas (
          title
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching response:", error)
      throw error
    }

    // Convert wide format back to original format
    const answers: string[] = []
    for (let i = 1; i <= 10; i++) {
      const answer = (data as any)[`q${i}_response`]
      if (answer) {
        answers.push(answer)
      }
    }

    const compatibleResponse: ResponseData = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      persona: (data as any).personas?.title || "Unknown",
      questions: [], // Would need to fetch from persona_questions if needed
      answers: answers,
      analysis: data.analysis,
      created_at: data.created_at,
    }

    console.log("Response fetched successfully:", compatibleResponse)
    return compatibleResponse
  } catch (error) {
    console.error("Error in getResponseById:", error)
    return null
  }
}

export async function deleteResponse(id: string): Promise<boolean> {
  try {
    console.log("Deleting response from wide_responses table:", id)
    const { error } = await supabase.from("wide_responses").delete().eq("id", id)
    if (error) {
      console.error("Error deleting response:", error)
      throw error
    }
    console.log("Response deleted successfully")
    return true
  } catch (error) {
    console.error("Error in deleteResponse:", error)
    return false
  }
}

// New function to export responses in spreadsheet format
export async function exportPersonaResponses(personaId: string) {
  try {
    const { data: questions, error: questionsError } = await supabase
      .from("persona_questions")
      .select("question_text, question_number")
      .eq("persona_id", personaId)
      .order("question_number", { ascending: true })

    if (questionsError) throw questionsError

    const { data: responses, error: responsesError } = await supabase
      .from("wide_responses")
      .select("*")
      .eq("persona_id", personaId)
      .order("created_at", { ascending: false })

    if (responsesError) throw responsesError

    return {
      questions: questions || [],
      responses: responses || [],
      headers: [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        ...(questions || []).map((q) => `Q${q.question_number}: ${q.question_text}`),
        "Created At",
      ],
    }
  } catch (error) {
    console.error("Error exporting responses:", error)
    return null
  }
}
