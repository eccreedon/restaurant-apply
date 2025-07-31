import { supabase } from "./supabase"
import { analyzeAnswers } from "./ai-analysis"

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
  question_1?: string
  question_2?: string
  question_3?: string
  question_4?: string
  question_5?: string
  question_6?: string
  question_7?: string
  question_8?: string
  question_9?: string
  question_10?: string
  question_11?: string
  question_12?: string
  question_13?: string
  question_14?: string
  question_15?: string
  question_16?: string
  question_17?: string
  question_18?: string
  question_19?: string
  question_20?: string
  answer_1?: string
  answer_2?: string
  answer_3?: string
  answer_4?: string
  answer_5?: string
  answer_6?: string
  answer_7?: string
  answer_8?: string
  answer_9?: string
  answer_10?: string
  answer_11?: string
  answer_12?: string
  answer_13?: string
  answer_14?: string
  answer_15?: string
  answer_16?: string
  answer_17?: string
  answer_18?: string
  answer_19?: string
  answer_20?: string
  analysis?: any
  created_at?: string
}

export interface SaveResponseResult {
  success: boolean
  error?: string
  data?: ResponseData
  analysis?: any
}

export async function saveResponse(responseData: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  persona: string
  questions: string[]
  answers: string[]
}): Promise<{ success: boolean; error?: string }> {
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

    // Get AI analysis (disabled for now)
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

    // Prepare data for wide format database using the correct column names
    const insertData: any = {
      persona_id: personaData.id,
      first_name: responseData.first_name.trim(),
      last_name: responseData.last_name.trim(),
      email: responseData.email.trim(),
      phone: responseData.phone?.trim() || null,
      analysis: analysis,
    }

    // Add questions and answers using the correct column naming (q1_response, q2_response, etc.)
    for (let i = 0; i < Math.min(responseData.questions.length, responseData.answers.length, 20); i++) {
      insertData[`question_${i + 1}`] = responseData.questions[i]
      insertData[`q${i + 1}_response`] = responseData.answers[i] // Use q1_response format
    }

    console.log("Saving to wide_responses table with data:", insertData)

    // Save to wide_responses table
    const { error } = await supabase.from("wide_responses").insert([insertData])

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Response saved successfully")

    return {
      success: true,
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

    const { data, error } = await supabase.from("wide_responses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching responses:", error)
      return []
    }

    console.log(`Fetched ${data?.length || 0} responses`)

    return (
      data?.map((row) => {
        // Extract questions and answers from the wide format using correct column names
        const questions: string[] = []
        const answers: string[] = []

        for (let i = 1; i <= 20; i++) {
          const question = row[`question_${i}`]
          const answer = row[`q${i}_response`] // Use q1_response format

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

export async function getResponseById(id: string): Promise<ResponseData | null> {
  try {
    console.log("Fetching response from wide_responses table:", id)

    const { data, error } = await supabase.from("wide_responses").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching response:", error)
      return null
    }

    // Convert wide format back to original format using correct column names
    const questions: string[] = []
    const answers: string[] = []
    for (let i = 1; i <= 20; i++) {
      const question = data[`question_${i}`]
      const answer = data[`q${i}_response`] // Use q1_response format
      if (question && answer) {
        questions.push(question)
        answers.push(answer)
      }
    }

    const compatibleResponse: ResponseData = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      persona: data.persona,
      questions,
      answers,
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
      return false
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
