"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users } from "lucide-react"
import { type PersonaConfig, iconMap } from "@/lib/persona-db"

interface PersonaSelectorProps {
  personas: PersonaConfig[]
  onPersonaSelect: (persona: PersonaConfig) => void
}

export function PersonaSelector({ personas, onPersonaSelect }: PersonaSelectorProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig | null>(null)
  const [displayPersonas, setDisplayPersonas] = useState<PersonaConfig[]>([])

  useEffect(() => {
    console.log("PersonaSelector useEffect - received personas:", personas)
    console.log("PersonaSelector personas count:", personas.length)
    setDisplayPersonas([...personas])
  }, [personas])

  const handlePersonaClick = (persona: PersonaConfig) => {
    console.log("Persona clicked:", persona)
    setSelectedPersona(persona)
  }

  const handleContinue = () => {
    if (selectedPersona) {
      onPersonaSelect(selectedPersona)
    }
  }

  const getPersonaIcon = (iconName: string) => {
    console.log("Looking for icon:", iconName)
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    console.log("Found icon component:", !!IconComponent)
    return IconComponent || Users
  }

  console.log("PersonaSelector rendering with displayPersonas:", displayPersonas)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Assessment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the assessment type that best matches your role or interests. Each assessment is tailored with
            specific questions designed for your context.
          </p>
          <div className="mt-4 text-sm text-gray-500">Debug: Showing {displayPersonas.length} personas</div>
        </div>

        {displayPersonas.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Assessments Available</h3>
            <p className="text-gray-600">Please check back later or contact an administrator.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayPersonas.map((persona) => {
                console.log("Rendering persona:", persona.title, "with icon:", persona.icon)
                const IconComponent = getPersonaIcon(persona.icon)
                return (
                  <Card
                    key={`${persona.id}-${persona.title}`}
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

            {selectedPersona && (
              <div className="text-center">
                <Card className="max-w-md mx-auto bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Ready to start?</h3>
                    <p className="text-gray-600 mb-4">
                      You've selected the <strong>{selectedPersona.title}</strong> assessment with{" "}
                      {selectedPersona.questions.length} questions.
                    </p>
                    <Button onClick={handleContinue} className="w-full" size="lg">
                      Continue to Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
