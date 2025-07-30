"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { backfillAnalysis } from "@/lib/backfill-analysis"

export default function BackfillPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<{ processed: number; errors: number } | null>(null)

  const handleBackfill = async () => {
    setIsRunning(true)
    setResults(null)

    try {
      const result = await backfillAnalysis()
      setResults({ processed: result.processed, errors: result.errors })
    } catch (error) {
      console.error("Backfill failed:", error)
      setResults({ processed: 0, errors: 1 })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Backfill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This will analyze all responses that don't currently have AI analysis. This process may take several
              minutes depending on the number of responses.
            </p>

            <Button onClick={handleBackfill} disabled={isRunning} className="w-full">
              {isRunning ? "Running Backfill..." : "Start AI Analysis Backfill"}
            </Button>

            {isRunning && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Processing responses...</p>
              </div>
            )}

            {results && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Backfill Complete</h3>
                <p className="text-green-700">Processed: {results.processed} responses</p>
                {results.errors > 0 && <p className="text-red-700">Errors: {results.errors}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
