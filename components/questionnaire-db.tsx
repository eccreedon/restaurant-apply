"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Persona, Answer, QuestionnaireData } from "@/app/page"
import { analyzeAnswers } from "@/lib/ai-analysis"
import { getPersonaFromDB } from "@/lib/persona-db"
import { useEffect } from "react"

interface QuestionnaireProps {
  persona: Persona
  onComplete: (data: QuestionnaireData) => void
  onBack: () => void
}

export function QuestionnaireDB({ persona, onComplete, onBack }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPersonaQuestions = async () => {
      try {
        const personaData = await getPersonaFromDB(persona)
        if (personaData) {
          setQuestions(personaData.questions)
        }
      } catch (error) {
        console.error("Error loading persona questions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPersonaQuestions()
  }, [persona])

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  const handleNext = () => {
    if (currentAnswer.trim()) {
      const newAnswer: Answer = {
        questionId: currentQuestion + 1,
        question: questions[currentQuestion],
        answer: currentAnswer.trim(),
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)
      setCurrentAnswer("")

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        handleComplete(updatedAnswers)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      const previousAnswer = answers[currentQuestion - 1]
      if (previousAnswer) {
        setCurrentAnswer(previousAnswer.answer)
        setAnswers(answers.slice(0, -1))
      }
    }
  }

  const handleComplete = async (finalAnswers: Answer[]) => {
    setIsAnalyzing(true)
    try {
      const aiSummary = await analyzeAnswers(persona, finalAnswers)
      onComplete({
        persona,
        answers: finalAnswers,
        aiSummary,
      })
    } catch (error) {
      console.error("Error analyzing answers:", error)
      onComplete({
        persona,
        answers: finalAnswers,
        aiSummary: "Analysis temporarily unavailable. Please try again later.",
      })
    }
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Questions</h3>
          <p className="text-slate-600">Please wait while we load your assessment questions...</p>
        </CardContent>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">No Questions Available</h3>
          <p className="text-slate-600">This persona doesn't have any questions configured.</p>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Analyzing Your Responses</h3>
          <p className="text-slate-600">
            Our AI is evaluating your answers and generating your personalized assessment...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{questions[currentQuestion]}</p>

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
              {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next"}
              {currentQuestion < questions.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
