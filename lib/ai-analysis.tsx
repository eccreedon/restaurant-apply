export interface AnalysisResult {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: string
}

export async function analyzeAnswers(questions: string[], answers: string[], persona: string): Promise<AnalysisResult> {
  try {
    console.log("Calling AI analysis API for persona:", persona)

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
      throw new Error(`API call failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("AI analysis completed successfully")

    return result
  } catch (error) {
    console.error("Error calling AI analysis API:", error)

    // Return a fallback analysis
    return {
      summary: `Candidate has completed the ${persona} assessment. Manual review recommended.`,
      strengths: ["Completed all required questions", "Showed engagement with the process"],
      concerns: ["AI analysis temporarily unavailable"],
      recommendation: "Manual Review Required",
    }
  }
}
