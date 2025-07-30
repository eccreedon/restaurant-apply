import {
  createResponseSession,
  saveResponse,
  completeResponseSession,
  getQuestionsByPersona,
} from "@/lib/supabase-helpers"
import type { Question } from "@/types/question" // Declare the Question variable

export class QuestionnaireHandler {
  private sessionId: string | null = null
  private questions: Question[] = []

  async initializeSession(personaId: string, respondentData?: { email?: string; name?: string }) {
    // Get questions for this persona
    this.questions = await getQuestionsByPersona(personaId)

    // Create response session
    const session = await createResponseSession(personaId, respondentData)
    this.sessionId = session.id

    return this.questions
  }

  async saveAnswer(questionIndex: number, answer: string) {
    if (!this.sessionId || !this.questions[questionIndex]) {
      throw new Error("Session not initialized or invalid question index")
    }

    const question = this.questions[questionIndex]
    await saveResponse(this.sessionId, question.id, answer)
  }

  async completeQuestionnaire() {
    if (!this.sessionId) {
      throw new Error("Session not initialized")
    }

    await completeResponseSession(this.sessionId)
  }

  getQuestions() {
    return this.questions
  }
}
