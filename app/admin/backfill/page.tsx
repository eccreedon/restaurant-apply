"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { backfillAIAnalysis, type BackfillProgress } from "@/lib/backfill-analysis"
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function BackfillPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<BackfillProgress | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const handleStartBackfill = async () => {
    setIsRunning(true)
    setIsComplete(false)
    setProgress({ total: 0, processed: 0, successful: 0, failed: 0 })

    try {
      const finalProgress = await backfillAIAnalysis((currentProgress) => {
        setProgress(currentProgress)
      })

      setProgress(finalProgress)
      setIsComplete(true)
    } catch (error) {
      console.error("Backfill failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const progressPercentage = progress ? (progress.processed / progress.total) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">AI Analysis Backfill</h1>
          <p className="text-gray-600 mt-2">Add AI analysis to existing responses that don't have it yet</p>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Backfill Status</CardTitle>
            </CardHeader>
            <CardContent>
              {!progress && !isRunning && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Ready to analyze existing responses</p>
                  <Button onClick={handleStartBackfill} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Start AI Analysis Backfill
                  </Button>
                </div>
              )}

              {progress && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {progress.processed} / {progress.total}
                    </span>
                  </div>

                  <Progress value={progressPercentage} className="w-full" />

                  {progress.current && (
                    <p className="text-sm text-gray-600">
                      Currently processing: <span className="font-medium">{progress.current}</span>
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium">Successful</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {progress.successful}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <XCircle className="h-4 w-4 text-red-600 mr-1" />
                        <span className="text-sm font-medium">Failed</span>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {progress.failed}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-sm font-medium">Remaining</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {progress.total - progress.processed}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {isComplete && (
                <div className="text-center py-4 border-t mt-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">Backfill Complete!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    All existing responses have been processed with AI analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <p>Identifies all responses that don't have AI analysis</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <p>Processes each response through the AI analysis system</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <p>Updates the database with scores, strengths, recommendations, etc.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">4</span>
                  </div>
                  <p>Preserves all existing data while adding the AI insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
