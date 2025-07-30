import { supabase } from "./supabase"
import { analyzeAnswers } from "./ai-analysis"
import { getAllPersonasFromDB } from "./persona-db"

export interface BackfillProgress {
  total: number
  processed: number
  successful: number
  failed: number
  current?: string
}

export async function backfillAIAnalysis(onProgress?: (progress: BackfillProgress) => void): Promise<BackfillProgress> {
  console.log("Starting AI analysis backfill...")

  // Get all personas for mapping
  const personas = await getAllPersonasFromDB()
  const personaMap = new Map(personas.map((p) => [p.id, p]))

  // Get responses that need analysis
  const { data: responses, error } = await supabase
    .from("wide_responses")
    .select(`
      id,
      persona_id,
      first_name,
      last_name,
      q1_response,
      q2_response,
      q3_response,
      q4_response,
      q5_response,
      q6_response,
      q7_response,
      q8_response,
      q9_response,
      q10_response,
      analysis
    `)
    .or("analysis.is.null,analysis->>'summary'.is.null")
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`)
  }

  const progress: BackfillProgress = {
    total: responses.length,
    processed: 0,
    successful: 0,
    failed: 0,
  }

  console.log(`Found ${responses.length} responses that need AI analysis`)

  for (const response of responses) {
    try {
      progress.current = `${response.first_name} ${response.last_name}`
      onProgress?.(progress)

      // Get persona info
      const persona = personaMap.get(response.persona_id)
      if (!persona) {
        console.warn(`Persona not found for response ${response.id}`)
        progress.failed++
        continue
      }

      // Collect answers from Q1-Q10 columns
      const answers: string[] = []
      for (let i = 1; i <= 10; i++) {
        const answer = (response as any)[`q${i}_response`]
        if (answer) {
          answers.push(answer)
        }
      }

      if (answers.length === 0) {
        console.warn(`No answers found for response ${response.id}`)
        progress.failed++
        continue
      }

      console.log(`Analyzing response ${response.id} for ${persona.title}...`)

      // Generate AI analysis
      const analysis = await analyzeAnswers(persona.questions, answers, persona.title)

      // Update the response with analysis
      const { error: updateError } = await supabase.from("wide_responses").update({ analysis }).eq("id", response.id)

      if (updateError) {
        console.error(`Failed to update response ${response.id}:`, updateError)
        progress.failed++
      } else {
        console.log(`Successfully analyzed response ${response.id}`)
        progress.successful++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error processing response ${response.id}:`, error)
      progress.failed++
    } finally {
      progress.processed++
      onProgress?.(progress)
    }
  }

  console.log(`Backfill completed: ${progress.successful} successful, ${progress.failed} failed`)
  return progress
}

// Function to backfill analysis for specific responses
export async function backfillSpecificResponses(
  responseIds: string[],
  onProgress?: (progress: BackfillProgress) => void,
): Promise<BackfillProgress> {
  const personas = await getAllPersonasFromDB()
  const personaMap = new Map(personas.map((p) => [p.id, p]))

  const { data: responses, error } = await supabase.from("wide_responses").select("*").in("id", responseIds)

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`)
  }

  const progress: BackfillProgress = {
    total: responses.length,
    processed: 0,
    successful: 0,
    failed: 0,
  }

  for (const response of responses) {
    try {
      progress.current = `${response.first_name} ${response.last_name}`
      onProgress?.(progress)

      const persona = personaMap.get(response.persona_id)
      if (!persona) {
        progress.failed++
        continue
      }

      const answers: string[] = []
      for (let i = 1; i <= 10; i++) {
        const answer = response[`q${i}_response`]
        if (answer) answers.push(answer)
      }

      const analysis = await analyzeAnswers(persona.questions, answers, persona.title)

      const { error: updateError } = await supabase.from("wide_responses").update({ analysis }).eq("id", response.id)

      if (updateError) {
        progress.failed++
      } else {
        progress.successful++
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      progress.failed++
    } finally {
      progress.processed++
      onProgress?.(progress)
    }
  }

  return progress
}
