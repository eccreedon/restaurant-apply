export async function analyzeAnswers(questions: string[], answers: string[], persona: string) {
  try {
    console.log("Starting AI analysis with:", { questions, answers, persona })

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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("AI analysis result:", result)
    return result
  } catch (error) {
    console.error("Error in analyzeAnswers:", error)
    throw error
  }
}
