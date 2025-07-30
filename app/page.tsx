"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

      if (result.success) {
        // Don't set analysis - we just need to know it was successful
        setAnalysis({ success: true })
      } else {
        console.error("Failed to save response:", result.error)
        setAnalysis({ success: false, error: result.error })
      }
    } catch (error) {
      console.error("Error saving response:", error)
      setAnalysis({ success: false, error: "An unexpected error occurred" })
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
    return <RespondentInfoStep onComplete={handleInfoComplete} />
  }

  if (currentStep === "persona") {
    return <PersonaSelectorStep personas={personas} onPersonaSelect={handlePersonaSelect} onBack={handleBackToInfo} />
  }

  if (currentStep === "questions" && selectedPersona) {
    return (
      <QuestionnaireStep persona={selectedPersona} onComplete={handleQuestionsComplete} onBack={handleBackToPersona} />
    )
  }

  if (currentStep === "results") {
    return (
      <ThankYouStep
        respondentName={respondentInfo?.firstName}
        isLoading={isLoading}
        success={analysis?.success}
        error={analysis?.error}
        onRestart={handleRestart}
      />
    )
  }

  return null
}

// Respondent Info Step Component
function RespondentInfoStep({ onComplete }: { onComplete: (info: RespondentData) => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.firstName.trim()) {
      alert("First name is required")
      return
    }

    if (!formData.lastName.trim()) {
      alert("Last name is required")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      alert("Please enter a valid email address")
      return
    }

    // Validate phone number (must be exactly 10 digits)
    const phoneDigits = formData.phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      alert("Phone number must be exactly 10 digits")
      return
    }

    // If all validation passes, proceed
    onComplete({
      ...formData,
      phone: phoneDigits, // Store just the digits
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tell us about yourself</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "") // Remove non-digits
                if (value.length <= 10) {
                  let formatted = value
                  if (value.length >= 6) {
                    formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`
                  } else if (value.length >= 3) {
                    formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`
                  }
                  setFormData({ ...formData, phone: formatted })
                }
              }}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}

// Persona Selector Step Component
function PersonaSelectorStep({
  personas,
  onPersonaSelect,
  onBack,
}: {
  personas: PersonaConfig[]
  onPersonaSelect: (persona: PersonaConfig) => void
  onBack: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-gray-600">Select the position that best matches your experience or interest</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {personas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onPersonaSelect(persona)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center`}
                  style={{ backgroundColor: persona.color }}
                >
                  <span className="text-2xl text-white">👨‍🍳</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{persona.title}</h3>
                <p className="text-gray-600 text-sm">{persona.description}</p>
                <p className="text-xs text-gray-500 mt-2">{persona.questions.length} questions</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={onBack} className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            ← Back to Info
          </button>
        </div>
      </div>
    </div>
  )
}

// Questionnaire Step Component
function QuestionnaireStep({
  persona,
  onComplete,
  onBack,
}: {
  persona: PersonaConfig
  onComplete: (answers: string[]) => void
  onBack: () => void
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(persona.questions.length).fill(""))

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < persona.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{persona.title} Assessment</h1>
              <span className="text-sm text-gray-500">
                {currentQuestion + 1} of {persona.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / persona.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{persona.questions[currentQuestion]}</h2>
            <textarea
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={currentQuestion === 0 ? onBack : handlePrevious}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← {currentQuestion === 0 ? "Back to Personas" : "Previous"}
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion]?.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion === persona.questions.length - 1 ? "Complete Assessment" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Thank You Step Component (Updated)
function ThankYouStep({
  respondentName,
  isLoading,
  success,
  error,
  onRestart,
}: {
  respondentName?: string
  isLoading: boolean
  success?: boolean
  error?: string
  onRestart: () => void
}) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Submitting Your Assessment</h2>
          <p className="text-gray-600">Please wait while we save your responses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Thank you{respondentName ? `, ${respondentName}` : ""}!
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your assessment has been submitted successfully. We appreciate you taking the time to complete our
              questionnaire.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our team will review your responses and reach out to you if you're a good fit for any of our open
              positions.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Submission Error</h1>
            <p className="text-gray-600 mb-6">
              We encountered an issue while submitting your assessment. Please try again.
            </p>
            {error && <p className="text-sm text-red-600 mb-6">{error}</p>}
          </>
        )}

        <button
          onClick={onRestart}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {success ? "Take Another Assessment" : "Try Again"}
        </button>
      </div>
    </div>
  )
}
