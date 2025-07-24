"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Users, FileText, TrendingUp, Phone, Mail, Calendar, User } from "lucide-react"
import { getAllPersonasFromDB, iconMap, type PersonaConfig } from "@/lib/persona-db"
import { getAllResponses, type ResponseData } from "@/lib/responses-db"
import { PersonaManagerDB } from "@/components/persona-manager-db"

export default function AdminDashboard() {
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [responses, setResponses] = useState<ResponseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [personaData, responseData] = await Promise.all([getAllPersonasFromDB(), getAllResponses()])
      setPersonas(personaData)
      setResponses(responseData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyAssessmentUrl = () => {
    const url = window.location.origin
    navigator.clipboard.writeText(url)
    alert("Assessment URL copied to clipboard!")
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

  const getPersonaStats = () => {
    const stats: { [key: string]: number } = {}
    responses.forEach((response) => {
      stats[response.persona] = (stats[response.persona] || 0) + 1
    })
    return stats
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your assessment system and view responses</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Personas</p>
                  <p className="text-2xl font-bold text-gray-900">{personas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      responses.filter((r) => {
                        const responseDate = new Date(r.created_at!)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return responseDate > weekAgo
                      }).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Button onClick={copyAssessmentUrl} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Assessment URL
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="personas">Manage Personas</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Responses</CardTitle>
                <CardDescription>All assessment responses with AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No responses yet</p>
                    <p className="text-sm text-gray-500">Share your assessment URL to start collecting responses</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {responses.map((response) => {
                      const persona = personas.find((p) => p.title === response.persona)
                      const IconComponent = persona ? iconMap[persona.icon as keyof typeof iconMap] || User : User

                      return (
                        <Card key={response.id} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <IconComponent className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">
                                    {response.first_name} {response.last_name}
                                  </CardTitle>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-4 w-4" />
                                      {response.email}
                                    </div>
                                    {response.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {response.phone}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {formatDate(response.created_at!)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary">{response.persona}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* AI Analysis */}
                            {response.analysis && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Summary:</p>
                                    <p className="text-sm text-gray-600">{response.analysis.summary}</p>
                                  </div>

                                  {response.analysis.strengths.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-green-700">Strengths:</p>
                                      <ul className="text-sm text-gray-600 list-disc list-inside">
                                        {response.analysis.strengths.map((strength, idx) => (
                                          <li key={idx}>{strength}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {response.analysis.concerns.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-orange-700">Concerns:</p>
                                      <ul className="text-sm text-gray-600 list-disc list-inside">
                                        {response.analysis.concerns.map((concern, idx) => (
                                          <li key={idx}>{concern}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  <div>
                                    <p className="text-sm font-medium text-blue-700">Recommendation:</p>
                                    <p className="text-sm text-gray-600">{response.analysis.recommendation}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Questions and Answers */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900">Responses</h4>
                              {response.questions.map((question, idx) => (
                                <div key={idx} className="border-l-2 border-gray-200 pl-4">
                                  <p className="text-sm font-medium text-gray-700">{question}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {response.answers[idx] || "No answer provided"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personas">
            <PersonaManagerDB onPersonasChange={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
