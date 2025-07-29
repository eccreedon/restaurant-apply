"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { PersonaConfig } from "@/lib/persona-db"

interface QuestionnaireProps {
  persona: PersonaConfig
  onComplete: (answers: string[]) => void
  onBack: () => void
}

export function Questionnaire({ persona, onComplete, onBack }: QuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(persona.questions?.length || 0).fill(""))
  const [currentAnswer, setCurrentAnswer] = useState("")

  // Safety check for persona and questions
  if (!persona || !persona.questions || persona.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
            <p className="text-gray-600 mb-4">No questions available for this assessment.</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const questions = persona.questions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleNext = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = currentAnswer

    if (currentQuestionIndex < questions.length - 1) {
      setAnswers(newAnswers)
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer(newAnswers[currentQuestionIndex + 1] || "")
    } else {
      // Last question - complete the questionnaire
      setAnswers(newAnswers)
      onComplete(newAnswers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newAnswers = [...answers]
      newAnswers[currentQuestionIndex] = currentAnswer
      setAnswers(newAnswers)
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentAnswer(newAnswers[currentQuestionIndex - 1] || "")
    }
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = currentAnswer.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-xl">{persona.title} Assessment</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">{Math.round(progress)}% Complete</div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestion}</h3>
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Please provide your answer here..."
              className="min-h-32"
              rows={4}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back to Personas
              </Button>
              {currentQuestionIndex > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2 bg-transparent">
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>

            <Button onClick={handleNext} disabled={!canProceed} className="flex items-center gap-2">
              {isLastQuestion ? "Complete Assessment" : "Next Question"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
