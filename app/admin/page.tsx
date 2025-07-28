"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Users, FileText, BarChart3, Trash2, Eye, Calendar, Mail, Phone, User } from "lucide-react"
import { getAllResponses, deleteResponse, type ResponseData } from "@/lib/responses-db"
import { getAllPersonasFromDB, type PersonaConfig, iconMap } from "@/lib/persona-db"
import { PersonaManagerDB } from "@/components/persona-manager-db"
import { toast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [responses, setResponses] = useState<ResponseData[]>([])
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [selectedResponse, setSelectedResponse] = useState<ResponseData | null>(null)
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
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResponse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this response?")) return

    try {
      const success = await deleteResponse(id)
      if (success) {
        setResponses(responses.filter((r) => r.id !== id))
        setSelectedResponse(null)
        toast({
          title: "Success",
          description: "Response deleted successfully",
        })
      } else {
        throw new Error("Failed to delete response")
      }
    } catch (error) {
      console.error("Error deleting response:", error)
      toast({
        title: "Error",
        description: "Failed to delete response",
        variant: "destructive",
      })
    }
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
    const stats = responses.reduce(
      (acc, response) => {
        acc[response.persona] = (acc[response.persona] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return stats
  }

  const getPersonaIcon = (personaTitle: string) => {
    const persona = personas.find((p) => p.title === personaTitle)
    if (persona && iconMap[persona.icon as keyof typeof iconMap]) {
      return iconMap[persona.icon as keyof typeof iconMap]
    }
    return User
  }

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage personas and view assessment responses</p>
        </div>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Responses ({responses.length})
            </TabsTrigger>
            <TabsTrigger value="personas" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Personas ({personas.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Responses List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Responses</CardTitle>
                  <CardDescription>Click on a response to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {responses.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No responses yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {responses.map((response) => (
                          <Card
                            key={response.id}
                            className={`cursor-pointer transition-colors ${
                              selectedResponse?.id === response.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedResponse(response)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">
                                  {response.first_name} {response.last_name}
                                </h3>
                                <Badge variant="secondary">{response.persona}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{response.email}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {response.created_at && formatDate(response.created_at)}
                                </span>
                                <span>{response.answers.length} answers</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Response Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Response Details
                    {selectedResponse && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => selectedResponse.id && handleDeleteResponse(selectedResponse.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedResponse ? (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-6">
                        {/* Header with User Info - Matching Screenshot Format */}
                        <div className="border-l-4 border-l-blue-500 pl-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                {(() => {
                                  const IconComponent = getPersonaIcon(selectedResponse.persona)
                                  return <IconComponent className="h-5 w-5 text-blue-600" />
                                })()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {selectedResponse.first_name} {selectedResponse.last_name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {selectedResponse.email}
                                  </div>
                                  {selectedResponse.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {selectedResponse.phone}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {selectedResponse.created_at && formatDate(selectedResponse.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">{selectedResponse.persona}</Badge>
                          </div>

                          {/* AI Analysis - Matching Screenshot Format */}
                          {selectedResponse.analysis && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold mb-4">AI Analysis</h4>

                              <div className="space-y-4">
                                <div>
                                  <p className="font-medium mb-2">Summary:</p>
                                  <p className="text-gray-700">{selectedResponse.analysis.summary}</p>
                                </div>

                                {selectedResponse.analysis.strengths &&
                                  selectedResponse.analysis.strengths.length > 0 && (
                                    <div>
                                      <p className="font-medium text-green-700 mb-2">Strengths:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {selectedResponse.analysis.strengths.map((strength: string, index: number) => (
                                          <li key={index} className="text-gray-700">
                                            {strength}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                {selectedResponse.analysis.concerns &&
                                  selectedResponse.analysis.concerns.length > 0 && (
                                    <div>
                                      <p className="font-medium text-orange-600 mb-2">Concerns:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {selectedResponse.analysis.concerns.map((concern: string, index: number) => (
                                          <li key={index} className="text-gray-700">
                                            {concern}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                {selectedResponse.analysis.recommendation && (
                                  <div>
                                    <p className="font-medium text-blue-600 mb-2">Recommendation:</p>
                                    <p className="text-gray-700">{selectedResponse.analysis.recommendation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <Separator className="my-6" />

                          {/* Questions & Answers */}
                          <div>
                            <h4 className="text-lg font-semibold mb-4">Responses</h4>
                            <div className="space-y-4">
                              {selectedResponse.questions.map((question, index) => (
                                <div key={index} className="space-y-2">
                                  <p className="font-medium text-gray-900">{question}</p>
                                  <p className="text-gray-700 whitespace-pre-wrap pl-4">
                                    {selectedResponse.answers[index] || "No response provided"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a response to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personas">
            <PersonaManagerDB />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{responses.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Personas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{personas.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Questions</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {personas.length > 0
                      ? Math.round(personas.reduce((acc, p) => acc + p.questions.length, 0) / personas.length)
                      : 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{responses.length > 0 ? "100%" : "0%"}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Responses by Persona</CardTitle>
                <CardDescription>Distribution of responses across different personas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(getPersonaStats()).map(([persona, count]) => (
                    <div key={persona} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{persona}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / responses.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(getPersonaStats()).length === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No response data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
