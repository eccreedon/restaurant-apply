"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PersonaSelector } from "@/components/persona-selector"
import { Questionnaire } from "@/components/questionnaire"
import { Results } from "@/components/results"
import { RespondentInfo } from "@/components/respondent-info"
import { Card, CardContent } from "@/components/ui/card"
import { getAssessmentById, saveAssessmentResponse } from "@/lib/assessment-db"
import { getPersonaFromDB } from "@/lib/persona-db"
import type { Persona, QuestionnaireData, Assessment } from "@/app/page"

interface RespondentData {
  name: string
  email: string
}

export default function AssessmentPage() {
  const params = useParams()
  const assessmentId = params.id as string

  const [currentStep, setCurrentStep] = useState<
    "info" | "persona" | "questionnaire" | "results" | "loading" | "error"
  >("loading")
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [respondentData, setRespondentData] = useState<RespondentData | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const loadedAssessment = await getAssessmentById(assessmentId)

        if (!loadedAssessment) {
          setError("Assessment not found or has expired")
          setCurrentStep("error")
          return
        }

        // Verify the persona still exists
        const persona = await getPersonaFromDB(loadedAssessment.persona)
        if (!persona) {
          setError("The persona for this assessment no longer exists")
          setCurrentStep("error")
          return
        }

        setAssessment(loadedAssessment)
        setCurrentStep("info")
      } catch (error) {
        console.error("Failed to load assessment:", error)
        setError("Failed to load assessment")
        setCurrentStep("error")
      }
    }

    if (assessmentId) {
      loadAssessment()
    }
  }, [assessmentId])

  const handleRespondentInfoSubmit = (data: RespondentData) => {
    setRespondentData(data)
    if (assessment?.persona) {
      setSelectedPersona(assessment.persona)
      setCurrentStep("questionnaire")
    } else {
      setCurrentStep("persona")
    }
  }

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona)
    setCurrentStep("questionnaire")
  }

  const handleQuestionnaireComplete = async (data: QuestionnaireData) => {
    if (!respondentData || !assessment) {
      setError("Missing required data")
      setCurrentStep("error")
      return
    }

    try {
      // Save response to database
      const savedResponse = await saveAssessmentResponse(assessment.id, respondentData.name, respondentData.email, data)

      if (!savedResponse) {
        setError("Failed to save your response. Please try again.")
        setCurrentStep("error")
        return
      }

      setQuestionnaireData(data)
      setCurrentStep("results")
    } catch (error) {
      console.error("Error saving response:", error)
      setError("Failed to save your response. Please try again.")
      setCurrentStep("error")
    }
  }

  if (currentStep === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Assessment</h3>
            <p className="text-slate-600">Please wait while we prepare your assessment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "error" || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Assessment Error</h3>
            <p className="text-slate-600">
              {error || "The assessment link you're looking for doesn't exist or has expired."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{assessment.title}</h1>
          <p className="text-slate-600">Complete this assessment to receive personalized feedback</p>
        </header>

        {currentStep === "info" && <RespondentInfo onSubmit={handleRespondentInfoSubmit} />}

        {currentStep === "persona" && <PersonaSelector onPersonaSelect={handlePersonaSelect} />}

        {currentStep === "questionnaire" && selectedPersona && (
          <Questionnaire
            persona={selectedPersona}
            onComplete={handleQuestionnaireComplete}
            onBack={() => setCurrentStep(assessment.persona ? "info" : "persona")}
          />
        )}

        {currentStep === "results" && questionnaireData && (
          <Results data={questionnaireData} onRestart={() => window.location.reload()} isPublicView={true} />
        )}
      </div>
    </div>
  )
}
