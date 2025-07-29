"use client"

import { useState, useEffect } from "react"
import { RespondentInfoComponent } from "@/components/respondent-info"
import { PersonaSelector } from "@/components/persona-selector"
import { Questionnaire } from "@/components/questionnaire"
import { Results } from "@/components/results"
import { getAllPersonasFromDB, type PersonaConfig } from "@/lib/persona-db"
import { saveResponse } from "@/lib/responses-db"
import { toast } from "@/hooks/use-toast"

type Step = "info" | "persona" | "questions" | "results"

interface RespondentInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("info")
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [respondentInfo, setRespondentInfo] = useState<RespondentInfo | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      console.log("Loading personas from database...")
      const data = await getAllPersonasFromDB()
      console.log("Loaded personas:", data)
      setPersonas(data)
    } catch (error) {
      console.error("Error loading personas:", error)
      toast({
        title: "Error",
        description: "Failed to load personas. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const handleInfoComplete = (info: RespondentInfo) => {
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
    if (!respondentInfo || !selectedPersona) {
      console.error("Missing required data:", { respondentInfo, selectedPersona })
      toast({
        title: "Error",
        description: "Missing required information. Please start over.",
        variant: "destructive",
      })
      return
    }

    console.log("Questions completed with answers:", questionAnswers)
    setAnswers(questionAnswers)
    setIsLoading(true)
    setCurrentStep("results")

    try {
      const response = await saveResponse({
        first_name: respondentInfo.firstName,
        last_name: respondentInfo.lastName,
        email: respondentInfo.email,
        phone: respondentInfo.phone,
        persona: selectedPersona.title,
        questions: selectedPersona.questions,
        answers: questionAnswers,
      })

      console.log("Response saved:", response)
      setAnalysis(response.analysis)

      toast({
        title: "Success",
        description: "Assessment completed successfully!",
      })
    } catch (error) {
      console.error("Error saving response:", error)
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      })
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
  }

  const handleBackToPersona = () => {
    setCurrentStep("persona")
  }

  if (currentStep === "info") {
    return <RespondentInfoComponent onComplete={handleInfoComplete} />
  }

  if (currentStep === "persona") {
    return <PersonaSelector personas={personas} onSelect={handlePersonaSelect} onBack={handleBackToInfo} />
  }

  if (currentStep === "questions" && selectedPersona) {
    return <Questionnaire persona={selectedPersona} onComplete={handleQuestionsComplete} onBack={handleBackToPersona} />
  }

  if (currentStep === "results") {
    return <Results analysis={analysis} onRestart={handleRestart} />
  }

  return null
}
