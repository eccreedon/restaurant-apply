import type { PersonaConfig } from "@/lib/persona-db"

export interface QuestionnaireData {
  respondentInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  selectedPersona: PersonaConfig
  answers: string[]
}

export class QuestionnaireHandler {
  private data: Partial<QuestionnaireData> = {}

  setRespondentInfo(info: QuestionnaireData["respondentInfo"]) {
    this.data.respondentInfo = info
  }

  setSelectedPersona(persona: PersonaConfig) {
    this.data.selectedPersona = persona
  }

  setAnswers(answers: string[]) {
    this.data.answers = answers
  }

  getData(): QuestionnaireData | null {
    if (this.data.respondentInfo && this.data.selectedPersona && this.data.answers) {
      return this.data as QuestionnaireData
    }
    return null
  }

  reset() {
    this.data = {}
  }

  isComplete(): boolean {
    return !!(this.data.respondentInfo && this.data.selectedPersona && this.data.answers)
  }
}
