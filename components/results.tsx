"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

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
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Processing Your Assessment</h2>
            <p className="text-gray-600 mb-6">Your assessment is being analyzed. This may take a few moments.</p>
            <Button onClick={onRestart}>Start Over</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Assessment Complete!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for completing the assessment. Here's your personalized analysis.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Strengths */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.strengths ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 mt-0.5">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No specific strengths identified.</p>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-orange-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.concerns ? (
                <ul className="space-y-2">
                  {analysis.concerns.map((concern: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 mt-0.5">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{concern}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No specific areas for improvement identified.</p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.recommendations ? (
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-0.5">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No specific recommendations available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overall Summary */}
        {analysis.summary && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Overall Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button onClick={onRestart} size="lg" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Take Another Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
