import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface AnalysisResult {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendation: string
}

export async function POST(request: NextRequest) {
  try {
    const { questions, answers, persona } = await request.json()

    console.log("Starting AI analysis for persona:", persona)

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set")
      throw new Error("API key not configured")
    }

    const prompt = `You are an expert HR professional analyzing responses for a ${persona} position. 

Questions and Answers:
${questions.map((q: string, i: number) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "No response"}`).join("\n\n")}

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

    console.log("Sending request to Anthropic...")

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

    console.log("Received response from Anthropic")

    const analysisText = response.content[0].type === "text" ? response.content[0].text : ""

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

    const result: AnalysisResult = {
      summary,
      strengths,
      concerns,
      recommendation,
    }

    console.log("Parsed analysis result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in AI analysis:", error)

    // Return a fallback analysis
    const fallback: AnalysisResult = {
      summary: `Candidate has completed the assessment. Manual review recommended.`,
      strengths: ["Completed all required questions", "Showed engagement with the process"],
      concerns: ["AI analysis temporarily unavailable"],
      recommendation: "Manual Review Required",
    }

    return NextResponse.json(fallback)
  }
}
