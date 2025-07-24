"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, User, Briefcase } from "lucide-react"
import { getAllPersonasFromDB, iconMap, type PersonaConfig } from "@/lib/persona-db"
import { saveResponse, type ResponseData } from "@/lib/responses-db"
import { toast } from "@/hooks/use-toast"

type Step = "info" | "persona" | "questionnaire" | "complete"

interface RespondentInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<Step>("info")
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
    const personaData = await getAllPersonasFromDB()
    setPersonas(personaData)
  }

  const isInfoComplete = () => {
    return respondentInfo.firstName.trim() && respondentInfo.lastName.trim() && respondentInfo.email.trim()
  }

  const handleInfoSubmit = () => {
    if (isInfoComplete()) {
      setCurrentStep("persona")
    }
  }

  const handlePersonaSelect = (persona: PersonaConfig) => {
    setSelectedPersona(persona)
    setAnswers(new Array(persona.questions.length).fill(""))
    setCurrentStep("questionnaire")
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (selectedPersona && currentQuestionIndex < selectedPersona.questions.length - 1) {
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
    try {
      const responseData: ResponseData = {
        first_name: respondentInfo.firstName,
        last_name: respondentInfo.lastName,
        email: respondentInfo.email,
        phone: respondentInfo.phone,
        persona: selectedPersona.title,
        questions: selectedPersona.questions,
        answers: answers,
      }

      const result = await saveResponse(responseData)

      if (result.success) {
        setCurrentStep("complete")
        toast({
          title: "Assessment Complete!",
          description: "Thank you for completing the assessment. Your responses have been saved.",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to save your response: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProgress = () => {
    if (currentStep === "info") return 25
    if (currentStep === "persona") return 50
    if (currentStep === "questionnaire") {
      const questionProgress = selectedPersona
        ? ((currentQuestionIndex + 1) / selectedPersona.questions.length) * 25
        : 0
      return 75 + questionProgress
    }
    return 100
  }

  const renderInfoStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Welcome to Our Assessment</CardTitle>
        <CardDescription>Please provide your contact information to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={respondentInfo.firstName}
              onChange={(e) => setRespondentInfo({ ...respondentInfo, firstName: e.target.value })}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={respondentInfo.lastName}
              onChange={(e) => setRespondentInfo({ ...respondentInfo, lastName: e.target.value })}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={respondentInfo.email}
            onChange={(e) => setRespondentInfo({ ...respondentInfo, email: e.target.value })}
            placeholder="Enter your email address"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={respondentInfo.phone}
            onChange={(e) => setRespondentInfo({ ...respondentInfo, phone: e.target.value })}
            placeholder="Enter your phone number"
          />
        </div>
        <Button onClick={handleInfoSubmit} className="w-full" size="lg" disabled={!isInfoComplete()}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )

  const renderPersonaStep = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Select Your Role</CardTitle>
        <CardDescription>Choose the position that best matches what you're applying for</CardDescription>
      </CardHeader>
      <CardContent>
        {personas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No roles available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map((persona) => {
              const IconComponent = iconMap[persona.icon as keyof typeof iconMap] || User
              return (
                <Card
                  key={persona.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 ${persona.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{persona.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
                    <Badge variant="secondary">{persona.questions.length} questions</Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setCurrentStep("info")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderQuestionnaireStep = () => {
    if (!selectedPersona) return null

    const IconComponent = iconMap[selectedPersona.icon as keyof typeof iconMap] || User
    const currentQuestion = selectedPersona.questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === selectedPersona.questions.length - 1
    const canProceed = answers[currentQuestionIndex]?.trim()

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 ${selectedPersona.color} rounded-full flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{selectedPersona.title} Assessment</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {selectedPersona.questions.length}
              </CardDescription>
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / selectedPersona.questions.length) * 100} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="answer" className="text-lg font-medium">
              {currentQuestion}
            </Label>
            <Textarea
              id="answer"
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[120px]"
              required
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCompleteStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
        <p className="text-lg text-gray-600 mb-6">
          Thank you, {respondentInfo.firstName}! Your responses have been submitted successfully.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            We'll review your responses and get back to you soon. If you have any questions, please don't hesitate to
            contact us.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Take Another Assessment
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
        </div>

        {currentStep === "info" && renderInfoStep()}
        {currentStep === "persona" && renderPersonaStep()}
        {currentStep === "questionnaire" && renderQuestionnaireStep()}
        {currentStep === "complete" && renderCompleteStep()}
      </div>
    </div>
  )
}
