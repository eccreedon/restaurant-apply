"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Users } from "lucide-react"
import { type PersonaConfig, iconMap } from "@/lib/persona-db"

interface PersonaSelectorProps {
  personas: PersonaConfig[]
  onPersonaSelect: (persona: PersonaConfig) => void
  onBack: () => void
}

export function PersonaSelector({ personas, onPersonaSelect, onBack }: PersonaSelectorProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)

  const handlePersonaClick = (persona: PersonaConfig) => {
    setSelectedPersona(persona)
  }

  const handleContinue = () => {
    if (selectedPersona) {
      onPersonaSelect(selectedPersona)
    }
  }

  const getPersonaIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent || Users
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Assessment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the assessment type that best matches your role or interests. Each assessment is tailored with
            specific questions designed for your context.
          </p>
        </div>

        {personas.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Assessments Available</h3>
            <p className="text-gray-600">Please check back later or contact an administrator.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {personas.map((persona) => {
                const IconComponent = getPersonaIcon(persona.icon)
                return (
                  <Card
                    key={persona.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedPersona?.id === persona.id
                        ? "ring-2 ring-blue-500 shadow-lg transform scale-105"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handlePersonaClick(persona)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl mb-2">{persona.title}</CardTitle>
                      <CardDescription className="text-gray-600">{persona.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {persona.questions.length} questions
                        </Badge>
                        {selectedPersona?.id === persona.id && (
                          <Badge className="bg-blue-500 text-white">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back to Info
              </Button>

              {selectedPersona && (
                <Card className="max-w-md bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Ready to start?</h3>
                        <p className="text-sm text-gray-600">
                          <strong>{selectedPersona.title}</strong> - {selectedPersona.questions.length} questions
                        </p>
                      </div>
                      <Button onClick={handleContinue} className="flex items-center gap-2">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
