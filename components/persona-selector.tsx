"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Palette, Users, TrendingUp, Megaphone } from "lucide-react"
import type { Persona } from "@/app/page"
import { personaConfigs } from "@/lib/question-templates"

interface PersonaSelectorProps {
  onPersonaSelect: (persona: Persona) => void
}

const personas = personaConfigs

export function PersonaSelector({ onPersonaSelect }: PersonaSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Select Your Role</h2>
        <p className="text-slate-600">Choose the role that best matches your position for a tailored assessment</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => {
          const iconMap = { Code, Palette, Users, TrendingUp, Megaphone }
          const Icon = iconMap[persona.icon as keyof typeof iconMap]
          return (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center">
                <div
                  className={`w-12 h-12 ${persona.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{persona.title}</CardTitle>
                <CardDescription>{persona.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => onPersonaSelect(persona.id)}>
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
