import Anthropic from "@anthropic-ai/sdk"

export interface AnalysisResult {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function analyzeAnswers(questions: string[], answers: string[], persona: string): Promise<AnalysisResult> {
  try {
    console.log("Starting AI analysis for persona:", persona)

    const prompt = `You are an expert HR professional analyzing responses for a ${persona} position. 

Questions and Answers:
${questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "No response"}`).join("\n\n")}

Please provide a comprehensive analysis in the following format:

SUMMARY:
[2-3 sentences summarizing the candidate's overall suitability for the ${persona} role]

STRENGTHS:
- [Key strength 1]
- [Key strength 2]
- [Key strength 3]

CONCERNS:
- [Concern 1 if any]
- [Concern 2 if any]

RECOMMENDATION:
[Clear recommendation: Highly Recommended, Recommended, Consider with Reservations, or Not Recommended]`

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const analysisText = response.content[0].type === "text" ? response.content[0].text : ""
    console.log("AI analysis completed")

    // Parse the response into structured format
    const sections = analysisText.split(/(?:SUMMARY:|STRENGTHS:|CONCERNS:|RECOMMENDATION:)/i)

    const summary = sections[1]?.trim() || analysisText
    const strengthsText = sections[2]?.trim() || ""
    const concernsText = sections[3]?.trim() || ""
    const recommendation = sections[4]?.trim() || "Analysis pending"

    const strengths = strengthsText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean)

    const concerns = concernsText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean)

    return {
      summary,
      strengths,
      concerns,
      recommendation,
    }
  } catch (error) {
    console.error("Error in AI analysis:", error)

    // Return a fallback analysis
    return {
      summary: `Candidate has completed the ${persona} assessment. Manual review recommended.`,
      strengths: ["Completed all required questions", "Showed engagement with the process"],
      concerns: ["AI analysis temporarily unavailable"],
      recommendation: "Manual Review Required",
    }
  }
}
