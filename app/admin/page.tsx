"use client"

import { PersonaManagerDB } from "@/components/persona-manager-db"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage personas, questions, and assessments with database persistence</p>
        </header>
        <PersonaManagerDB />
      </div>
    </div>
  )
}
