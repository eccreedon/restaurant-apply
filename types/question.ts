export interface Question {
  id: string
  text: string
  type: "text" | "multiple-choice" | "rating"
  required: boolean
  options?: string[]
}

export interface QuestionResponse {
  questionId: string
  answer: string | number
  timestamp: Date
}

export interface AssessmentResult {
  respondentId: string
  personaId: string
  responses: QuestionResponse[]
  completedAt: Date
  score?: number
}
