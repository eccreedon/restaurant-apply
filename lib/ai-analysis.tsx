import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export interface AnalysisResult {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendations: string[]
}

export async function analyzeAnswers(questions: string[], answers: string[], persona: string): Promise<AnalysisResult> {
  try {
    const prompt = `
You are an expert hiring manager analyzing responses for a ${persona} position. 

Questions and Answers:
${questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "No answer provided"}`).join("\n\n")}

Please provide a comprehensive analysis in the following format:

SUMMARY:
[2-3 sentence overall assessment of the candidate]

STRENGTHS:
- [Key strength 1]
- [Key strength 2]
- [Key strength 3]

CONCERNS:
- [Concern 1 if any]
- [Concern 2 if any]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]

Keep the analysis professional, constructive, and specific to the ${persona} role.
`

    const { text } = await generateText({
      model: anthropic("claude-3-haiku-20240307"),
      prompt,
      maxTokens: 1000,
    })

    // Parse the response into structured format
    const sections = text.split(/(?:SUMMARY:|STRENGTHS:|CONCERNS:|RECOMMENDATIONS:)/i)

    const summary = sections[1]?.trim() || text.substring(0, 200) + "..."
    const strengthsText = sections[2]?.trim() || ""
    const concernsText = sections[3]?.trim() || ""
    const recommendationsText = sections[4]?.trim() || ""

    const parseList = (text: string): string[] => {
      return text
        .split("\n")
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 5) // Limit to 5 items
    }

    return {
      summary,
      strengths: parseList(strengthsText),
      concerns: parseList(concernsText),
      recommendations: parseList(recommendationsText),
    }
  } catch (error) {
    console.error("Error analyzing answers:", error)
    return {
      summary: "Analysis could not be completed at this time.",
      strengths: [],
      concerns: [],
      recommendations: ["Please review responses manually."],
    }
  }
}
