"use client"

import { useState, useEffect } from "react"
import { PersonaSelector } from "@/components/persona-selector"
import { Questionnaire } from "@/components/questionnaire"
import { RespondentInfo } from "@/components/respondent-info"
import { Results } from "@/components/results"
import { getAllPersonasFromDB, type PersonaConfig } from "@/lib/persona-db"
import { saveResponse, type SaveResponseResult } from "@/lib/responses-db"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export type Persona = string

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"info" | "persona" | "questions" | "results">("info")
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [respondentInfo, setRespondentInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [answers, setAnswers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<SaveResponseResult | null>(null)

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      setIsLoading(true)
      console.log("Loading personas from database...")
      const data = await getAllPersonasFromDB()
      console.log("Loaded personas:", data)
      setPersonas(data)
    } catch (error) {
      console.error("Error loading personas:", error)
      setPersonas([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInfoSubmit = (info: { name: string; email: string; phone: string }) => {
    const [firstName, ...lastNameParts] = info.name.split(" ")
    const lastName = lastNameParts.join(" ")

    setRespondentInfo({
      firstName: firstName || "",
      lastName: lastName || "",
      email: info.email,
      phone: info.phone,
    })
    setCurrentStep("persona")
  }

  const handlePersonaSelect = (persona: PersonaConfig) => {
    console.log("Selected persona:", persona)
    console.log("Persona questions:", persona.questions)
    setSelectedPersona(persona)
    setCurrentStep("questions")
  }

  const handleQuestionsComplete = async (questionAnswers: string[]) => {
    if (!selectedPersona) {
      console.error("No persona selected")
      return
    }

    console.log("Completing questions with answers:", questionAnswers)
    setAnswers(questionAnswers)
    setIsSubmitting(true)

    try {
      const result = await saveResponse({
        first_name: respondentInfo.firstName,
        last_name: respondentInfo.lastName,
        email: respondentInfo.email,
        phone: respondentInfo.phone || undefined,
        persona: selectedPersona.title,
        questions: selectedPersona.questions,
        answers: questionAnswers,
      })

      console.log("Save result:", result)
      setSubmitResult(result)
      setCurrentStep("results")
    } catch (error) {
      console.error("Error submitting assessment:", error)
      setSubmitResult({
        success: false,
        error: "Failed to submit assessment. Please try again.",
      })
      setCurrentStep("results")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep("info")
    setSelectedPersona(null)
    setRespondentInfo({ firstName: "", lastName: "", email: "", phone: "" })
    setAnswers([])
    setSubmitResult(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Loading Assessment</h2>
            <p className="text-gray-600">Please wait while we prepare your assessment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Submitting Assessment</h2>
            <p className="text-gray-600">Please wait while we process your responses...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {currentStep === "info" && <RespondentInfo onSubmit={handleInfoSubmit} />}

      {currentStep === "persona" && (
        <PersonaSelector
          personas={personas}
          onPersonaSelect={handlePersonaSelect}
          onBack={() => setCurrentStep("info")}
        />
      )}

      {currentStep === "questions" && selectedPersona && (
        <Questionnaire
          persona={selectedPersona}
          onComplete={handleQuestionsComplete}
          onBack={() => setCurrentStep("persona")}
        />
      )}

      {currentStep === "results" && (
        <Results
          result={submitResult}
          respondentInfo={respondentInfo}
          persona={selectedPersona}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
