"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Copy, Eye, Users, Calendar, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { loadPersonasFromDB } from "@/lib/persona-db"
import { createAssessment, loadAssessmentsFromDB, deleteAssessmentFromDB, getAllResponses } from "@/lib/assessment-db"
import type { Assessment, Persona, AssessmentResponse, PersonaConfig } from "@/app/page"

export function AdminDashboardDB() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [responses, setResponses] = useState<AssessmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [loadedAssessments, loadedPersonas, loadedResponses] = await Promise.all([
        loadAssessmentsFromDB(),
        loadPersonasFromDB(),
        getAllResponses(),
      ])

      setAssessments(loadedAssessments)
      setPersonas(loadedPersonas)
      setResponses(loadedResponses)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = async (title: string, personaId: Persona) => {
    const newAssessment = await createAssessment(title, personaId)

    if (newAssessment) {
      setAssessments([newAssessment, ...assessments])
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Assessment created successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    const success = await deleteAssessmentFromDB(assessmentId)

    if (success) {
      setAssessments(assessments.filter((a) => a.id !== assessmentId))
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Assessment link copied to clipboard",
    })
  }

  const getPersonaTitle = (personaId: string) => {
    const persona = personas.find((p) => p.id === personaId)
    return persona?.title || personaId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assessment Dashboard</h2>
          <p className="text-slate-600">Manage your assessments and view responses (stored in database)</p>
        </div>
        <CreateAssessmentDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateAssessment={handleCreateAssessment}
          personas={personas}
        />
      </div>

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">My Assessments ({assessments.length})</TabsTrigger>
          <TabsTrigger value="responses">All Responses ({responses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{assessment.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{getPersonaTitle(assessment.persona)}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {assessment.responses.length} responses
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{assessment.title}"? This will also delete all associated
                            responses.
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Shareable Link:</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={assessment.shareableLink} readOnly className="font-mono text-sm" />
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(assessment.shareableLink)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(assessment.shareableLink, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Responses ({assessment.responses.length})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {assessments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-600">
                    No assessments created yet. Create your first assessment to get started!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          {responses.length > 0 ? (
            <div className="grid gap-4">
              {responses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{response.respondentName}</CardTitle>
                        <p className="text-slate-600">{response.respondentEmail}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{getPersonaTitle(response.data.persona)}</Badge>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(response.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        <strong>Questions Answered:</strong> {response.data.answers.length}
                      </p>
                      {response.data.aiSummary && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">AI Summary:</p>
                          <p className="text-sm text-slate-700 line-clamp-3">{response.data.aiSummary}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center py-8">
                  No responses yet. Share your assessment links to start collecting responses!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CreateAssessmentDialog({
  isOpen,
  onOpenChange,
  onCreateAssessment,
  personas,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateAssessment: (title: string, persona: Persona) => void
  personas: PersonaConfig[]
}) {
  const [title, setTitle] = useState("")
  const [selectedPersona, setSelectedPersona] = useState<Persona>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && selectedPersona) {
      onCreateAssessment(title.trim(), selectedPersona)
      setTitle("")
      setSelectedPersona("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assessment Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Frontend Developer Skills Assessment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona">Target Role</Label>
            <Select value={selectedPersona} onValueChange={(value) => setSelectedPersona(value as Persona)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !selectedPersona}>
              Create Assessment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
