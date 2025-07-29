export interface AnalysisResult {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: string
}

export async function analyzeAnswers(
  questions: string[],
  answers: string[],
  persona: string,
): Promise<AnalysisResult | null> {
  try {
    console.log("Starting AI analysis for persona:", persona)

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questions,
        answers,
        persona,
      }),
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("AI analysis completed:", result)

    return result
  } catch (error) {
    console.error("Error in analyzeAnswers:", error)
    return null
  }
}
