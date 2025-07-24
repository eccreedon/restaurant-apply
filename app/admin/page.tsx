"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonaManagerDB } from "@/components/persona-manager-db"
import { getAllResponses, type Response } from "@/lib/responses-db"
import { getAllPersonasFromDB, type PersonaConfig } from "@/lib/persona-db"
import { Copy, ExternalLink, Users, FileText, Calendar, Mail, Phone, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [responses, setResponses] = useState<Response[]>([])
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [responsesData, personasData] = await Promise.all([getAllResponses(), getAllPersonasFromDB()])
      setResponses(responsesData)
      setPersonas(personasData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAssessmentUrl = () => {
    const url = window.location.origin
    navigator.clipboard.writeText(url)
    toast({
      title: "URL Copied!",
      description: "Assessment URL has been copied to your clipboard.",
    })
  }

  const getPersonaById = (id: string) => {
    return personas.find((p) => p.id === id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const responsesByPersona = responses.reduce(
    (acc, response) => {
      const personaId = response.persona_id
      if (!acc[personaId]) {
        acc[personaId] = []
      }
      acc[personaId].push(response)
      return acc
    },
    {} as Record<string, Response[]>,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Manage personas and view assessment responses</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={copyAssessmentUrl} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Assessment URL
              </Button>
              <Button onClick={() => window.open(window.location.origin, "_blank")} variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Assessment
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Responses ({responses.length})
            </TabsTrigger>
            <TabsTrigger value="personas" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage Personas ({personas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Responses Yet</h3>
                  <p className="text-slate-600 mb-4">Share your assessment URL to start collecting responses.</p>
                  <Button onClick={copyAssessmentUrl}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Assessment URL
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(responsesByPersona).map(([personaId, personaResponses]) => {
                  const persona = getPersonaById(personaId)
                  if (!persona) return null

                  return (
                    <Card key={personaId}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${persona.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            <span className="text-lg">{persona.icon}</span>
                          </div>
                          <div>
                            <CardTitle>{persona.title}</CardTitle>
                            <p className="text-slate-600">{personaResponses.length} responses</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {personaResponses.map((response) => (
                            <Card key={response.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-slate-500" />
                                      <span className="font-medium">
                                        {response.respondent_first_name} {response.respondent_last_name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-slate-500" />
                                      <span className="text-sm text-slate-600">{response.respondent_email}</span>
                                    </div>
                                    {response.respondent_phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-600">{response.respondent_phone}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(response.created_at)}
                                  </div>
                                </div>

                                {response.ai_analysis && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
                                    <p className="text-blue-800 text-sm">{response.ai_analysis}</p>
                                  </div>
                                )}

                                <div className="space-y-3">
                                  <h4 className="font-medium">Responses:</h4>
                                  {persona.questions.map((question, index) => (
                                    <div key={index} className="border-l-2 border-slate-200 pl-4">
                                      <p className="text-sm font-medium text-slate-700 mb-1">
                                        Q{index + 1}: {question}
                                      </p>
                                      <p className="text-sm text-slate-600">
                                        {response.responses[index] || "No response"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personas">
            <PersonaManagerDB onPersonasChange={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
