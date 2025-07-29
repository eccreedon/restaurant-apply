"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import type { PersonaConfig } from "@/lib/persona-db"

interface QuestionnaireProps {
  persona: PersonaConfig
  onComplete: (answers: string[]) => void
  onBack: () => void
}

export function Questionnaire({ persona, onComplete, onBack }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(persona.questions.length).fill(""))
  const [currentAnswer, setCurrentAnswer] = useState("")

  // Add safety checks for persona and questions
  if (!persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Assessment</h2>
            <p className="text-gray-600 mb-4">No persona data found. Please try again.</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!persona.questions || !Array.isArray(persona.questions) || persona.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">
              The selected assessment ({persona.title}) doesn't have any questions configured.
            </p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / persona.questions.length) * 100

  const handleNext = () => {
    if (currentAnswer.trim()) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = currentAnswer.trim()
      setAnswers(newAnswers)

      if (currentQuestion < persona.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setCurrentAnswer(newAnswers[currentQuestion + 1] || "")
      } else {
        onComplete(newAnswers)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = currentAnswer
      setAnswers(newAnswers)
      setCurrentQuestion(currentQuestion - 1)
      setCurrentAnswer(newAnswers[currentQuestion - 1] || "")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>
                Question {currentQuestion + 1} of {persona.questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {persona.title} Assessment - Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{persona.questions[currentQuestion]}</p>

            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Please provide a detailed response..."
              className="min-h-[150px] resize-none"
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
                {currentQuestion === persona.questions.length - 1 ? "Complete Assessment" : "Next"}
                {currentQuestion < persona.questions.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
