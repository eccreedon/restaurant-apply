"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RotateCcw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PersonaConfig } from "@/lib/persona-db"
import type { SaveResponseResult } from "@/lib/responses-db"

interface ResultsProps {
  result: SaveResponseResult | null
  respondentInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  persona: PersonaConfig | null
  onStartOver: () => void
}

export function Results({ result, respondentInfo, persona, onStartOver }: ResultsProps) {
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Results Available</h2>
            <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
            <Button onClick={onStartOver}>Start Over</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Submission Failed</h2>
            <p className="text-gray-600 mb-4">
              {result.error || "An error occurred while submitting your assessment."}
            </p>
            <Button onClick={onStartOver}>Try Again</Button>
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
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Assessment Complete!</CardTitle>
            <p className="text-gray-600 mt-2">
              Thank you for completing the assessment. Your responses have been successfully submitted.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Your Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {respondentInfo.firstName} {respondentInfo.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {respondentInfo.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {respondentInfo.phone}
                  </p>
                  <p>
                    <strong>Assessment Type:</strong> <Badge variant="secondary">{persona?.title}</Badge>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Assessment Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Questions Answered:</strong> {persona?.questions?.length || 0}
                  </p>
                  <p>
                    <strong>Submission ID:</strong> {result.id}
                  </p>
                  <p>
                    <strong>Submitted:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {result.analysis && (
              <div>
                <h3 className="font-semibold text-lg mb-3">AI Analysis</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: result.analysis.replace(/\n/g, "<br>") }} />
                  </div>
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your assessment results have been saved. You will receive a follow-up email with detailed feedback
                within 24 hours.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button onClick={onStartOver} variant="outline" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Another Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
