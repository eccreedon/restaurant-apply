"use client"

import { useState, useEffect } from "react"
import { RespondentInfo } from "@/components/respondent-info"
import { PersonaSelector } from "@/components/persona-selector"
import { Questionnaire } from "@/components/questionnaire"
import { Results } from "@/components/results"
import { getAllPersonasFromDB, type PersonaConfig } from "@/lib/persona-db"
import { saveResponse } from "@/lib/responses-db"

type Step = "info" | "persona" | "questions" | "results"

interface RespondentData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("info")
  const [respondentInfo, setRespondentInfo] = useState<RespondentData | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      const personaData = await getAllPersonasFromDB()
      console.log("Personas loaded in page component:", personaData)
      setPersonas(personaData)
    } catch (error) {
      console.error("Error loading personas:", error)
    }
  }

  const handleInfoComplete = (info: RespondentData) => {
    console.log("Respondent info completed:", info)
    setRespondentInfo(info)
    setCurrentStep("persona")
  }

  const handlePersonaSelect = (persona: PersonaConfig) => {
    console.log("Persona selected:", persona)
    setSelectedPersona(persona)
    setCurrentStep("questions")
  }

  const handleQuestionsComplete = async (questionAnswers: string[]) => {
    console.log("Questions completed:", questionAnswers)
    setAnswers(questionAnswers)
    setIsLoading(true)
    setCurrentStep("results")

    if (!respondentInfo || !selectedPersona) {
      console.error("Missing respondent info or persona")
      setAnalysis(null)
      setIsLoading(false)
      return
    }

    try {
      const result = await saveResponse({
        first_name: respondentInfo.firstName,
        last_name: respondentInfo.lastName,
        email: respondentInfo.email,
        phone: respondentInfo.phone,
        persona: selectedPersona.title,
        questions: selectedPersona.questions,
        answers: questionAnswers,
      })

      console.log("Save response result:", result)

      if (result.success && result.analysis) {
        try {
          const parsedAnalysis = JSON.parse(result.analysis)
          setAnalysis(parsedAnalysis)
        } catch (parseError) {
          console.error("Error parsing analysis:", parseError)
          setAnalysis({ summary: result.analysis })
        }
      } else {
        console.error("Failed to save response:", result.error)
        setAnalysis(null)
      }
    } catch (error) {
      console.error("Error saving response:", error)
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setCurrentStep("info")
    setRespondentInfo(null)
    setSelectedPersona(null)
    setAnswers([])
    setAnalysis(null)
  }

  const handleBackToInfo = () => {
    setCurrentStep("info")
    setSelectedPersona(null)
  }

  const handleBackToPersona = () => {
    setCurrentStep("persona")
  }

  if (currentStep === "info") {
    return <RespondentInfo onComplete={handleInfoComplete} />
  }

  if (currentStep === "persona") {
    return <PersonaSelector personas={personas} onPersonaSelect={handlePersonaSelect} onBack={handleBackToInfo} />
  }

  if (currentStep === "questions" && selectedPersona) {
    return <Questionnaire persona={selectedPersona} onComplete={handleQuestionsComplete} onBack={handleBackToPersona} />
  }

  if (currentStep === "results") {
    return <Results analysis={analysis} onRestart={handleRestart} />
  }

  return null
}
