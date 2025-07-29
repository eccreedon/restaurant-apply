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

  if (!persona || !persona.questions || persona.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Questions</h2>
            <p className="text-gray-600 mb-6">
              There was an issue loading the questions for this assessment. Please try again or contact support.
            </p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = persona.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / persona.questions.length) * 100

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < persona.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const isLastQuestion = currentQuestionIndex === persona.questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const currentAnswer = answers[currentQuestionIndex] || ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">{persona.title} Assessment</CardTitle>
                <CardDescription>
                  Question {currentQuestionIndex + 1} of {persona.questions.length}
                </CardDescription>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{currentQuestion}</h3>
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button onClick={handleNext} disabled={!currentAnswer.trim()} className="flex items-center gap-2">
                {isLastQuestion ? "Complete Assessment" : "Next"}
                {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
