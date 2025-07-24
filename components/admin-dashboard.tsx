"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Eye, Users, Calendar, ExternalLink } from "lucide-react"
import { personaConfigs } from "@/lib/question-templates"
import type { Assessment, Persona } from "@/app/page"

export function AdminDashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([
    {
      id: "demo-1",
      title: "Developer Skills Assessment",
      persona: "developer",
      createdAt: new Date().toISOString(),
      shareableLink: `${typeof window !== "undefined" ? window.location.origin : ""}/assessment/demo-1`,
      responses: [],
    },
  ])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateAssessment = (title: string, persona: Persona | "any") => {
    const newAssessment: Assessment = {
      id: crypto.randomUUID(),
      title,
      persona: persona === "any" ? "developer" : persona, // Default for "any"
      createdAt: new Date().toISOString(),
      shareableLink: `${typeof window !== "undefined" ? window.location.origin : ""}/assessment/${crypto.randomUUID()}`,
      responses: [],
    }

    setAssessments([...assessments, newAssessment])
    setIsCreateDialogOpen(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assessment Dashboard</h2>
          <p className="text-slate-600">Manage your assessments and view responses</p>
        </div>
        <CreateAssessmentDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateAssessment={handleCreateAssessment}
        />
      </div>

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">My Assessments</TabsTrigger>
          <TabsTrigger value="responses">All Responses</TabsTrigger>
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
                        <Badge variant="secondary">
                          {personaConfigs.find((p) => p.id === assessment.persona)?.title}
                        </Badge>
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
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CreateAssessmentDialog({
  isOpen,
  onOpenChange,
  onCreateAssessment,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateAssessment: (title: string, persona: Persona | "any") => void
}) {
  const [title, setTitle] = useState("")
  const [selectedPersona, setSelectedPersona] = useState<Persona | "any">("any")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onCreateAssessment(title.trim(), selectedPersona)
      setTitle("")
      setSelectedPersona("any")
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
            <Select value={selectedPersona} onValueChange={(value) => setSelectedPersona(value as Persona | "any")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Role (Let user choose)</SelectItem>
                {personaConfigs.map((persona) => (
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
            <Button type="submit" disabled={!title.trim()}>
              Create Assessment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
