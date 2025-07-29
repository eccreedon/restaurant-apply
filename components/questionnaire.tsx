"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
  const [answers, setAnswers] = useState<string[]>([])

  // Safety check for persona and questions
  if (!persona || !persona.questions || !Array.isArray(persona.questions) || persona.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Error Loading Questions</h2>
            <p className="text-gray-600 mb-4">
              There was a problem loading the questions for this assessment. The persona may not have any questions
              configured.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const questions = persona.questions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answer
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Complete the questionnaire
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const currentAnswer = answers[currentQuestionIndex] || ""

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Selection
            </Button>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl">{persona.title} Assessment</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">{currentQuestion}</h3>

            {/* Multiple choice for rating questions */}
            {currentQuestion.toLowerCase().includes("rate") ||
            currentQuestion.toLowerCase().includes("how would you") ||
            currentQuestion.toLowerCase().includes("scale") ? (
              <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1">1 - Poor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2">2 - Fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3">3 - Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="r4" />
                    <Label htmlFor="r4">4 - Very Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="r5" />
                    <Label htmlFor="r5">5 - Excellent</Label>
                  </div>
                </div>
              </RadioGroup>
            ) : (
              /* Text area for open-ended questions */
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Please provide your answer..."
                className="min-h-[120px]"
              />
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
              {isLastQuestion ? "Complete Assessment" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
