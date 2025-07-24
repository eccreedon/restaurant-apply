"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import { getAssessment, saveAssessmentResponse, type Assessment } from "@/lib/assessment-db"
import { getAllPersonasFromDB, type PersonaConfig } from "@/lib/persona-db"
import { analyzeAnswers } from "@/lib/ai-analysis"

type Step = "info" | "persona" | "questionnaire" | "complete"

export default function AssessmentPage() {
  const params = useParams()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>("info")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [respondentInfo, setRespondentInfo] = useState({
    name: "",
    email: "",
  })
  const [answers, setAnswers] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    loadAssessmentData()
  }, [assessmentId])

  const loadAssessmentData = async () => {
    setIsLoading(true)
    try {
      const [assessmentData, personasData] = await Promise.all([getAssessment(assessmentId), getAllPersonasFromDB()])

      if (!assessmentData) {
        // Handle assessment not found
        return
      }

      setAssessment(assessmentData)
      setPersonas(personasData)
    } catch (error) {
      console.error("Error loading assessment data:", error)
    } finally {
      setIsLoading(false)
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

  const goToNextQuestion = () => {
    if (selectedPersona && currentQuestionIndex < selectedPersona.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPersona || !assessment) return

    setIsSubmitting(true)
    try {
      // Generate AI analysis
      const analysis = await analyzeAnswers(selectedPersona.questions, answers, selectedPersona.title)

      // Save response to database
      await saveAssessmentResponse({
        assessment_id: assessment.id,
        persona_id: selectedPersona.id,
        respondent_name: respondentInfo.name,
        respondent_email: respondentInfo.email,
        responses: answers,
        ai_analysis: analysis.summary,
      })

      setCurrentStep("complete")
    } catch (error) {
      console.error("Error submitting assessment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    // This is a simplified version - you might want to import the actual icons
    return () => <div className="w-5 h-5 bg-slate-400 rounded"></div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading assessment...</span>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
            <p className="text-slate-600">The assessment you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{assessment.title}</h1>
          {assessment.description && <p className="text-slate-600">{assessment.description}</p>}
        </div>

        {/* Step: Respondent Info */}
        {currentStep === "info" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={respondentInfo.name}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={respondentInfo.email}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              </div>
              <Button
                onClick={() => setCurrentStep("persona")}
                disabled={!respondentInfo.name.trim() || !respondentInfo.email.trim()}
                className="w-full"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Persona Selection */}
        {currentStep === "persona" && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
              <p className="text-slate-600">Select the position that best matches your role or interest:</p>
            </CardHeader>
            <CardContent>
              {personas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No roles available for this assessment.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {personas.map((persona) => {
                    const IconComponent = getIconComponent(persona.icon)
                    return (
                      <Card
                        key={persona.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                        onClick={() => handlePersonaSelect(persona)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 ${persona.color} rounded-lg flex items-center justify-center`}>
                              <IconComponent />
                            </div>
                            <div>
                              <h3 className="font-semibold">{persona.title}</h3>
                              <p className="text-sm text-slate-600">{persona.description}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{persona.questions.length} questions</Badge>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
              <Button variant="outline" onClick={() => setCurrentStep("info")} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Questionnaire */}
        {currentStep === "questionnaire" && selectedPersona && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${selectedPersona.color} rounded-lg flex items-center justify-center`}>
                    {/* Icon would go here */}
                  </div>
                  <div>
                    <CardTitle>{selectedPersona.title}</CardTitle>
                    <p className="text-sm text-slate-600">
                      Question {currentQuestionIndex + 1} of {selectedPersona.questions.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / selectedPersona.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">{selectedPersona.questions[currentQuestionIndex]}</Label>
                <Textarea
                  value={answers[currentQuestionIndex] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Share your thoughts and experiences..."
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === selectedPersona.questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={!answers[currentQuestionIndex]?.trim() || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Assessment
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={goToNextQuestion} disabled={!answers[currentQuestionIndex]?.trim()}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Complete */}
        {currentStep === "complete" && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Assessment Complete!</h2>
              <p className="text-slate-600 mb-4">
                Thank you for completing the assessment. Your responses have been submitted successfully.
              </p>
              <p className="text-sm text-slate-500">
                The hiring team will review your responses and get back to you soon.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
