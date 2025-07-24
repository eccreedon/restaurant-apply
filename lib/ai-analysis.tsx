export interface AnalysisResult {
  strengths: string[]
  areas_for_improvement: string[]
  overall_assessment: string
  recommendations: string[]
  score: number
}

export async function analyzeResponses(
  persona: string,
  questions: string[],
  answers: string[],
): Promise<AnalysisResult | null> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona,
        questions,
        answers,
      }),
    })

    if (!response.ok) {
      console.error("Analysis API error:", response.status, response.statusText)
      return null
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error analyzing responses:", error)
    return null
  }
}
