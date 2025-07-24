"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, ArrowLeft, User } from "lucide-react"
import { getAllPersonasFromDB, iconMap, type PersonaConfig } from "@/lib/persona-db"
import { saveResponse } from "@/lib/responses-db"

type Step = "info" | "persona" | "questionnaire" | "complete"

interface RespondentInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>("info")
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [respondentInfo, setRespondentInfo] = useState<RespondentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      const personaData = await getAllPersonasFromDB()
      setPersonas(personaData)
    } catch (error) {
      console.error("Error loading personas:", error)
    }
  }

  const isInfoComplete = () => {
    return (
      respondentInfo.firstName.trim() && respondentInfo.lastName.trim() && respondentInfo.email.trim()
      // Phone is optional
    )
  }

  const handlePersonaSelect = (persona: PersonaConfig) => {
    setSelectedPersona(persona)
    setAnswers(new Array(persona.questions.length).fill(""))
    setStep("questionnaire")
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < selectedPersona!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPersona) return

    setIsSubmitting(true)
    console.log("Starting submission process...")

    try {
      const responseData = {
        first_name: respondentInfo.firstName,
        last_name: respondentInfo.lastName,
        email: respondentInfo.email,
        phone: respondentInfo.phone || null,
        persona: selectedPersona.title,
        questions: selectedPersona.questions,
        answers: answers,
      }

      console.log("Submitting response data:", responseData)

      const result = await saveResponse(responseData)

      if (result.success) {
        console.log("Response saved successfully!")
        setStep("complete")
      } else {
        console.error("Failed to save response:", result.error)
        alert(`Failed to save your response: ${result.error}`)
      }
    } catch (error) {
      console.error("Error during submission:", error)
      alert("An error occurred while saving your response. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestion = selectedPersona?.questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex] || ""
  const isLastQuestion = currentQuestionIndex === (selectedPersona?.questions.length || 0) - 1

  if (step === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Our Assessment</CardTitle>
            <CardDescription>Please provide your contact information to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={respondentInfo.firstName}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={respondentInfo.lastName}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={respondentInfo.email}
                onChange={(e) => setRespondentInfo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={respondentInfo.phone}
                onChange={(e) => setRespondentInfo((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number (optional)"
              />
            </div>
            <Button onClick={() => setStep("persona")} className="w-full" disabled={!isInfoComplete()}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "persona") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
            <p className="text-gray-600">Select the position you're interested in applying for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => {
              const IconComponent = iconMap[persona.icon as keyof typeof iconMap] || User
              return (
                <Card
                  key={persona.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-300"
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{persona.title}</CardTitle>
                    <CardDescription className="text-sm">{persona.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="w-full justify-center">
                      {persona.questions.length} Questions
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => setStep("info")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "questionnaire" && selectedPersona) {
    const IconComponent = iconMap[selectedPersona.icon as keyof typeof iconMap] || User

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedPersona.title} Assessment</h1>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {selectedPersona.questions.length}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedPersona.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px]"
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {isLastQuestion ? (
                  <Button onClick={handleSubmit} disabled={!currentAnswer.trim() || isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">Assessment Complete!</CardTitle>
            <CardDescription className="text-green-700">
              Thank you for completing the {selectedPersona?.title} assessment. We'll review your responses and get back
              to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You can now close this window. We have your contact information and will reach out to you.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
