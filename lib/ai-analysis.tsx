import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Answer, Persona } from "@/app/page"
import { personaConfigs } from "@/lib/question-templates"

export async function analyzeAnswers(persona: Persona, answers: Answer[]): Promise<string> {
  const personaContext = personaConfigs.reduce(
    (acc, config) => {
      acc[config.id] = config.description
      return acc
    },
    {} as Record<Persona, string>,
  )

  const prompt = `
You are an expert assessor evaluating a ${persona}'s skills and capabilities based on their questionnaire responses. 

Focus areas for ${persona}: ${personaContext[persona]}

Please analyze the following responses and provide a comprehensive assessment that includes:

1. **Overall Skill Level**: Rate their expertise (Beginner/Intermediate/Advanced/Expert)
2. **Key Strengths**: Identify 3-4 main strengths demonstrated in their responses
3. **Areas for Development**: Suggest 2-3 areas where they could improve
4. **Specific Insights**: Highlight notable approaches, experiences, or methodologies they mentioned
5. **Recommendations**: Provide actionable suggestions for their professional growth

Responses to analyze:
${answers
  .map(
    (answer, index) => `
Question ${index + 1}: ${answer.question}
Response: ${answer.answer}
`,
  )
  .join("\n")}

Please provide a detailed, constructive, and professional assessment that would be valuable for career development and skill improvement.
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating AI analysis:", error)
    throw new Error("Failed to generate analysis")
  }
}
