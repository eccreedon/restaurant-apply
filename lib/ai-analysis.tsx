export interface AnalysisResult {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: string
}

export async function analyzeAnswers(questions: string[], answers: string[], persona: string): Promise<AnalysisResult> {
  try {
    console.log("Starting AI analysis API call...")

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
      console.error("API response not ok:", response.status, response.statusText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("AI analysis completed successfully:", result)
    return result
  } catch (error) {
    console.error("Error in analyzeAnswers:", error)

    // Return fallback analysis
    return {
      summary: `Assessment completed for ${persona} position. Manual review recommended.`,
      strengths: ["Completed all required questions", "Engaged with the assessment process"],
      concerns: ["AI analysis temporarily unavailable"],
      recommendation: "Manual Review Required",
    }
  }
}
