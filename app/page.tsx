"use client"

import { AdminDashboardDB } from "@/components/admin-dashboard-db"

export type Persona = string // Changed from union type to allow dynamic personas

// Add PersonaConfig interface to the main types
export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  color: string
  questions: string[]
}

export interface Answer {
  questionId: number
  question: string
  answer: string
}

export interface QuestionnaireData {
  persona: Persona
  answers: Answer[]
  aiSummary?: string
}

export interface Assessment {
  id: string
  title: string
  persona: Persona
  createdAt: string
  shareableLink: string
  responses: AssessmentResponse[]
}

export interface AssessmentResponse {
  id: string
  assessmentId: string
  respondentName: string
  respondentEmail: string
  completedAt: string
  data: QuestionnaireData
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Assessment Manager</h1>
          <p className="text-slate-600">Create and manage skills assessments with full database integration</p>
        </header>

        <AdminDashboardDB />
      </div>
    </div>
  )
}
