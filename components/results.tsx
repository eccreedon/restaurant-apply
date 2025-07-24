"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Download, Share2 } from "lucide-react"
import type { QuestionnaireData } from "@/app/page"

interface ResultsProps {
  data: QuestionnaireData
  onRestart: () => void
  isPublicView?: boolean
}

export function Results({ data, onRestart, isPublicView = false }: ResultsProps) {
  const [activeTab, setActiveTab] = useState("summary")

  const getPersonaLabel = (persona: string) => {
    const labels = {
      developer: "Software Developer",
      designer: "UI/UX Designer",
      manager: "Project Manager",
      sales: "Sales Professional",
      marketing: "Marketing Specialist",
    }
    return labels[persona as keyof typeof labels] || persona
  }

  const handleDownload = () => {
    const content = `
Skills Assessment Results
========================

Role: ${getPersonaLabel(data.persona)}
Date: ${new Date().toLocaleDateString()}

AI ANALYSIS SUMMARY:
${data.aiSummary}

DETAILED RESPONSES:
${data.answers
  .map(
    (answer, index) => `
Question ${answer.questionId}: ${answer.question}

Answer: ${answer.answer}
`,
  )
  .join("\n---\n")}
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assessment-results-${data.persona}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="secondary" className="text-sm">
            {getPersonaLabel(data.persona)}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {data.answers.length} Questions Completed
          </Badge>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {!isPublicView && (
          <Button onClick={onRestart} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Take Another Assessment
          </Button>
        )}
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Results
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Results
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">AI Analysis Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                AI-Powered Skills Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {data.aiSummary || "Analysis is being processed..."}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {data.answers.map((answer, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Question {answer.questionId}</CardTitle>
                <p className="text-slate-600 font-normal">{answer.question}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
