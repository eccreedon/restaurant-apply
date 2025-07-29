"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { type PersonaConfig, iconMap } from "@/lib/persona-db"

interface PersonaSelectorProps {
  personas: PersonaConfig[]
  onPersonaSelect: (persona: PersonaConfig) => void
  onBack: () => void
}

export function PersonaSelector({ personas, onPersonaSelect, onBack }: PersonaSelectorProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)

  const handleContinue = () => {
    if (selectedPersona) {
      onPersonaSelect(selectedPersona)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Assessment</h1>
          <p className="text-lg text-gray-600">
            Select the position you're applying for to begin your personalized assessment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {personas.map((persona) => {
            const IconComponent = iconMap[persona.icon as keyof typeof iconMap]
            return (
              <Card
                key={persona.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPersona?.id === persona.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPersona(persona)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center`}
                    style={{ backgroundColor: persona.color + "20" }}
                  >
                    {IconComponent && <IconComponent className="w-8 h-8" style={{ color: persona.color }} />}
                  </div>
                  <CardTitle className="text-xl">{persona.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm">{persona.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedPersona && (
          <div className="text-center">
            <Button onClick={handleContinue} size="lg" className="px-8">
              Continue with {selectedPersona.title} Assessment
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
