"use client"

import { useState } from "react"
import { debugTables } from "@/lib/debug-tables"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [isRunning, setIsRunning] = useState(false)

  const handleDebug = async () => {
    setIsRunning(true)
    await debugTables()
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Database Debug</h1>
        <Button onClick={handleDebug} disabled={isRunning}>
          {isRunning ? "Running..." : "Debug Tables"}
        </Button>
        <p className="mt-4 text-gray-600">Check the browser console for debug output after clicking the button.</p>
      </div>
    </div>
  )
}
