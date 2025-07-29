"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ResultsProps {
  analysis: any
  onRestart: () => void
}

export function Results({ analysis, onRestart }: ResultsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Assessment Complete</CardTitle>
          <p className="text-gray-600 mt-2">
            Thank you for submitting the assessment. A member of our team will be in touch!
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onRestart} variant="outline" className="mt-4 bg-transparent">
            Start Over
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
