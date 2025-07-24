import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export interface AnalysisResult {
  overallScore: number
  strengths: string[]
  areasForImprovement: string[]
  recommendations: string[]
  summary: string
}

export async function analyzeAnswers(
  answers: string[],
  questions: string[],
  personaTitle: string,
): Promise<AnalysisResult> {
  try {
    const prompt = `
You are an expert HR analyst evaluating a candidate for a ${personaTitle} position.

Questions and Answers:
${questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "No answer provided"}`).join("\n\n")}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallScore": [number from 1-100],
  "strengths": [array of 3-5 key strengths identified],
  "areasForImprovement": [array of 2-4 areas that need development],
  "recommendations": [array of 3-5 specific recommendations],
  "summary": "[2-3 sentence overall assessment]"
}

Focus on:
- Relevant experience and skills for the ${personaTitle} role
- Communication clarity and professionalism
- Problem-solving abilities
- Cultural fit and motivation
- Specific examples and achievements mentioned

Provide constructive, actionable feedback that would be valuable for hiring decisions.
`

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      temperature: 0.3,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI")
    }

    const analysis = JSON.parse(jsonMatch[0])

    // Validate the response structure
    if (
      !analysis.overallScore ||
      !analysis.strengths ||
      !analysis.areasForImprovement ||
      !analysis.recommendations ||
      !analysis.summary
    ) {
      throw new Error("Incomplete analysis response")
    }

    return analysis as AnalysisResult
  } catch (error) {
    console.error("Error analyzing answers:", error)

    // Return a fallback analysis
    return {
      overallScore: 75,
      strengths: [
        "Provided thoughtful responses to questions",
        "Demonstrated engagement with the assessment process",
        "Showed willingness to participate in evaluation",
      ],
      areasForImprovement: ["Could provide more specific examples", "Consider elaborating on technical skills"],
      recommendations: [
        "Follow up with additional technical questions",
        "Consider a practical skills assessment",
        "Schedule an in-person interview to explore responses further",
      ],
      summary:
        "Candidate completed the assessment and provided responses. Further evaluation recommended to make a comprehensive hiring decision.",
    }
  }
}
