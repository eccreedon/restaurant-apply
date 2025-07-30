"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getAllResponses, deleteResponse, type ResponseData } from "@/lib/responses-db"
import {
  getAllPersonasFromDB,
  createPersonaInDB,
  updatePersonaInDB,
  deletePersonaFromDB,
  type PersonaConfig,
} from "@/lib/persona-db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus, Users, FileText, BarChart3, Eye, Mail, Calendar } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("responses")
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
      console.error("Error loading admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResponse = async (id: string) => {
    if (confirm("Are you sure you want to delete this response?")) {
      const success = await deleteResponse(id)
      if (success) {
        setResponses(responses.filter((r) => r.id !== id))
        if (selectedResponse?.id === id) {
          setSelectedResponse(null)
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{responses.length} Responses</Badge>
              <Badge variant="secondary">{personas.length} Personas</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Responses
            </TabsTrigger>
            <TabsTrigger value="personas" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personas
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses">
            <ResponsesTab
              responses={responses}
              selectedResponse={selectedResponse}
              onSelectResponse={setSelectedResponse}
              onDeleteResponse={handleDeleteResponse}
            />
          </TabsContent>

          <TabsContent value="personas">
            <PersonasTab personas={personas} onPersonasChange={setPersonas} onReload={loadData} />
          </TabsContent>

          <TabsContent value="analysis">
            <AnalysisTab responses={responses} personas={personas} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Responses Tab Component
function ResponsesTab({
  responses,
  selectedResponse,
  onSelectResponse,
  onDeleteResponse,
}: {
  responses: ResponseData[]
  selectedResponse: ResponseData | null
  onSelectResponse: (response: ResponseData) => void
  onDeleteResponse: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Response List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Responses ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {responses.map((response) => (
                <div
                  key={response.id}
                  onClick={() => onSelectResponse(response)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedResponse?.id === response.id ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {response.first_name} {response.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{response.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{response.persona}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteResponse(response.id!)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Response Details */}
      <div className="lg:col-span-2">
        {selectedResponse ? (
          <ResponseDetails response={selectedResponse} />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a response to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Response Details Component
function ResponseDetails({ response }: { response: ResponseData }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Responses</h2>
        <p className="text-gray-600">All assessment responses with AI analysis</p>
      </div>

      {/* Respondent Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {response.first_name} {response.last_name}
              </h3>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{response.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{response.created_at ? formatDate(response.created_at) : "Date not available"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-medium text-gray-900">{response.persona}</span>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {response.analysis && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>

          <div className="space-y-4">
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Summary:</span>
              </p>
              <p className="text-gray-700 mt-1">{response.analysis.summary}</p>
            </div>

            <div>
              <p className="text-green-600 font-medium">Strengths:</p>
              <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                {response.analysis.strengths && typeof response.analysis.strengths === "string" ? (
                  <li>{response.analysis.strengths}</li>
                ) : (
                  <>
                    <li>Completed all required questions</li>
                    <li>Showed engagement with the process</li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <p className="text-orange-600 font-medium">Concerns:</p>
              <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                {response.analysis.areas_for_improvement &&
                typeof response.analysis.areas_for_improvement === "string" ? (
                  <li>{response.analysis.areas_for_improvement}</li>
                ) : (
                  <li>AI analysis temporarily unavailable</li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-blue-600 font-medium">Recommendation:</p>
              <p className="text-gray-700 mt-1">{response.analysis.recommendations || "Manual Review Required"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Responses */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Responses</h3>
        <div className="space-y-6">
          {response.answers.map((answer, index) => (
            <div key={index}>
              <p className="font-medium text-gray-900 mb-2">
                Question {index + 1}:{" "}
                {response.questions && response.questions[index] ? response.questions[index] : `Question ${index + 1}`}
              </p>
              <p className="text-gray-700">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Personas Tab Component
function PersonasTab({
  personas,
  onPersonasChange,
  onReload,
}: {
  personas: PersonaConfig[]
  onPersonasChange: (personas: PersonaConfig[]) => void
  onReload: () => void
}) {
  const [editingPersona, setEditingPersona] = useState<PersonaConfig | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeletePersona = async (id: string) => {
    if (confirm("Are you sure you want to delete this persona?")) {
      try {
        await deletePersonaFromDB(id)
        onPersonasChange(personas.filter((p) => p.id !== id))
      } catch (error) {
        console.error("Error deleting persona:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Personas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPersona(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <PersonaForm
              persona={editingPersona}
              onSave={async (persona) => {
                await onReload()
                setIsDialogOpen(false)
                setEditingPersona(null)
              }}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingPersona(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{persona.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPersona(persona)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePersona(persona.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Questions:</span>
                  <Badge variant="secondary">{persona.questions.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Color:</span>
                  <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: persona.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Persona Form Component
function PersonaForm({
  persona,
  onSave,
  onCancel,
}: {
  persona: PersonaConfig | null
  onSave: (persona: PersonaConfig) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: persona?.title || "",
    description: persona?.description || "",
    icon: persona?.icon || "Users",
    color: persona?.color || "#3B82F6",
    questions: persona?.questions || [""],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const personaData = {
        ...formData,
        questions: formData.questions.filter((q) => q.trim()),
      }

      if (persona) {
        await updatePersonaInDB(persona.id, personaData)
      } else {
        await createPersonaInDB(personaData)
      }

      onSave(personaData as PersonaConfig)
    } catch (error) {
      console.error("Error saving persona:", error)
    }
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, ""],
    })
  }

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    })
  }

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = value
    setFormData({
      ...formData,
      questions: newQuestions,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{persona ? "Edit Persona" : "Add New Persona"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Questions</Label>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
          </div>
          <div className="space-y-2">
            {formData.questions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  className="flex-1"
                />
                {formData.questions.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeQuestion(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{persona ? "Update" : "Create"} Persona</Button>
        </div>
      </form>
    </>
  )
}

// Analysis Tab Component
function AnalysisTab({ responses, personas }: { responses: ResponseData[]; personas: PersonaConfig[] }) {
  const getPersonaStats = () => {
    return personas.map((persona) => {
      const personaResponses = responses.filter((r) => r.persona === persona.title)
      return {
        persona: persona.title,
        count: personaResponses.length,
        avgScore:
          personaResponses.length > 0
            ? personaResponses.reduce((acc, r) => {
                const score = r.analysis?.score || "0/10"
                const numScore = Number.parseInt(score.split("/")[0]) || 0
                return acc + numScore
              }, 0) / personaResponses.length
            : 0,
      }
    })
  }

  const stats = getPersonaStats()
  const totalResponses = responses.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{personas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {personas.length > 0 ? Math.round(totalResponses / personas.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responses by Persona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.persona} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{stat.persona}</h4>
                  <p className="text-sm text-gray-600">{stat.count} responses</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{stat.avgScore.toFixed(1)}/10</div>
                  <div className="text-sm text-gray-500">Avg Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
