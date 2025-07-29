"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, RotateCcw, AlertCircle } from "lucide-react"

interface ResultsProps {
  analysis: any
  onRestart: () => void
}

export function Results({ analysis, onRestart }: ResultsProps) {
  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Processing Your Assessment</h2>
            <p className="text-gray-600 mb-6">Your assessment is being processed. This may take a few moments.</p>
            <Button onClick={onRestart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start New Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
          <CardDescription>
            Thank you for completing the assessment. Here are your personalized results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">Strengths</h3>
              <div className="space-y-2">
                {analysis.strengths.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓
                    </Badge>
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {analysis.concerns && analysis.concerns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-700">Areas for Improvement</h3>
              <div className="space-y-2">
                {analysis.concerns.map((concern: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      !
                    </Badge>
                    <p className="text-sm">{concern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Recommendations</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      →
                    </Badge>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 text-center">
            <Button onClick={onRestart} size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Another Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
