"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, ExternalLink, Trash2, Users, Calendar, Copy, Check } from "lucide-react"
import { PersonaManagerDB } from "./persona-manager-db"
import {
  createAssessment,
  getAllAssessments,
  deleteAssessment,
  getAssessmentResponses,
  type Assessment,
  type AssessmentResponse,
} from "@/lib/assessment-db"
import { getAllPersonasFromDB, type PersonaConfig } from "@/lib/persona-db"

export function AdminDashboardDB() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [responses, setResponses] = useState<Record<string, AssessmentResponse[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [assessmentsData, personasData] = await Promise.all([getAllAssessments(), getAllPersonasFromDB()])

      setAssessments(assessmentsData)
      setPersonas(personasData)

      // Load responses for each assessment
      const responsesData: Record<string, AssessmentResponse[]> = {}
      for (const assessment of assessmentsData) {
        const assessmentResponses = await getAssessmentResponses(assessment.id)
        responsesData[assessment.id] = assessmentResponses
      }
      setResponses(responsesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAssessment = async () => {
    if (!formData.title.trim()) return

    try {
      const newAssessment = await createAssessment({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      })

      if (newAssessment) {
        setAssessments([newAssessment, ...assessments])
        setResponses((prev) => ({ ...prev, [newAssessment.id]: [] }))
        setFormData({ title: "", description: "" })
        setIsCreateDialogOpen(false)
        toast({
          title: "Success",
          description: "Assessment created successfully",
        })
      }
    } catch (error) {
      console.error("Error creating assessment:", error)
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const success = await deleteAssessment(assessmentId)
      if (success) {
        setAssessments(assessments.filter((a) => a.id !== assessmentId))
        setResponses((prev) => {
          const newResponses = { ...prev }
          delete newResponses[assessmentId]
          return newResponses
        })
        toast({
          title: "Success",
          description: "Assessment deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting assessment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      })
    }
  }

  const copyAssessmentLink = async (assessmentId: string) => {
    const url = `${window.location.origin}/assessment/${assessmentId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(assessmentId)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copied!",
        description: "Assessment link copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const getPersonaTitle = (personaId: string) => {
    const persona = personas.find((p) => p.id === personaId)
    return persona?.title || personaId
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assessment Dashboard</h1>
          <p className="text-slate-600">Manage your assessments and view responses</p>
        </div>
      </div>

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Your Assessments</h2>
              <p className="text-slate-600">Create and manage assessment links</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assessment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assessment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Assessment Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Restaurant Skills Assessment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this assessment evaluates"
                    />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Respondents will choose their role (Line Cook, Server, etc.)</li>
                      <li>• They'll answer role-specific questions</li>
                      <li>• You'll receive their responses with AI analysis</li>
                    </ul>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssessment} disabled={!formData.title.trim()}>
                      Create Assessment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {assessments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h4 className="text-lg font-semibold mb-2">No Assessments Yet</h4>
                <p className="text-slate-600 mb-4">Create your first assessment to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assessments.map((assessment) => {
                const assessmentResponses = responses[assessment.id] || []
                const responsesByPersona = assessmentResponses.reduce(
                  (acc, response) => {
                    acc[response.persona_id] = (acc[response.persona_id] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                )

                return (
                  <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{assessment.title}</CardTitle>
                          {assessment.description && (
                            <p className="text-sm text-slate-600 mt-1">{assessment.description}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{assessmentResponses.length} responses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {Object.keys(responsesByPersona).length > 0 && (
                        <div>
                          <Label className="text-xs font-medium text-slate-500">RESPONSES BY ROLE</Label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(responsesByPersona).map(([personaId, count]) => (
                              <Badge key={personaId} variant="secondary" className="text-xs">
                                {getPersonaTitle(personaId)}: {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyAssessmentLink(assessment.id)}
                          className="flex-1"
                        >
                          {copiedId === assessment.id ? (
                            <Check className="w-4 h-4 mr-1" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          {copiedId === assessment.id ? "Copied!" : "Copy Link"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/assessment/${assessment.id}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{assessment.title}"? This will also delete all
                                associated responses. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAssessment(assessment.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          <PersonaManagerDB onPersonasChange={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
