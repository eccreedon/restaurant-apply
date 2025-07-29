"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ResultsProps {
  analysis: any
  onRestart: () => void
}

export function Results({ analysis, onRestart }: ResultsProps) {
  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Assessment Complete</h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for submitting the assessment. A member of our team will be in touch!
            </p>
            <Button onClick={onRestart} size="lg">
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-3xl">Assessment Complete</CardTitle>
            <CardDescription className="text-lg">
              Here's your personalized analysis based on your responses
            </CardDescription>
          </CardHeader>
        </Card>

        {analysis.strengths && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-700">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.strengths}</p>
            </CardContent>
          </Card>
        )}

        {analysis.concerns && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-amber-700">Areas for Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.concerns}</p>
            </CardContent>
          </Card>
        )}

        {analysis.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-blue-700">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.recommendations}</p>
            </CardContent>
          </Card>
        )}

        {analysis.summary && !analysis.strengths && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.summary}</p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button onClick={onRestart} size="lg">
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
