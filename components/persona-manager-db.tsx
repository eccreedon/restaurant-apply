"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, User } from "lucide-react"
import {
  getAllPersonasFromDB,
  createPersonaInDB,
  updatePersonaInDB,
  deletePersonaFromDB,
  iconMap,
  iconCategories,
  type PersonaConfig,
} from "@/lib/persona-db"

interface PersonaManagerDBProps {
  onPersonasChange: () => void
}

export function PersonaManagerDB({ onPersonasChange }: PersonaManagerDBProps) {
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<PersonaConfig | null>(null)

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      setLoading(true)
      const data = await getAllPersonasFromDB()
      setPersonas(data)
    } catch (error) {
      console.error("Error loading personas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePersona = async (personaData: Omit<PersonaConfig, "id">) => {
    try {
      const result = await createPersonaInDB(personaData)
      if (result.success) {
        await loadPersonas()
        onPersonasChange()
        setIsCreateDialogOpen(false)
      } else {
        alert(`Error creating persona: ${result.error}`)
      }
    } catch (error) {
      console.error("Error creating persona:", error)
      alert("Failed to create persona")
    }
  }

  const handleUpdatePersona = async (id: string, updates: Partial<PersonaConfig>) => {
    try {
      const result = await updatePersonaInDB(id, updates)
      if (result.success) {
        await loadPersonas()
        onPersonasChange()
        setEditingPersona(null)
      } else {
        alert(`Error updating persona: ${result.error}`)
      }
    } catch (error) {
      console.error("Error updating persona:", error)
      alert("Failed to update persona")
    }
  }

  const handleDeletePersona = async (id: string) => {
    if (!confirm("Are you sure you want to delete this persona? This action cannot be undone.")) {
      return
    }

    try {
      const result = await deletePersonaFromDB(id)
      if (result.success) {
        await loadPersonas()
        onPersonasChange()
      } else {
        alert(`Error deleting persona: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting persona:", error)
      alert("Failed to delete persona")
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading personas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Personas</h2>
          <p className="text-gray-600">Create and edit assessment personas</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreatePersonaDialog onSubmit={handleCreatePersona} />
          </DialogContent>
        </Dialog>
      </div>

      {personas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No personas created yet</p>
            <p className="text-sm text-gray-500">Create your first persona to start collecting assessments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => {
            const IconComponent = iconMap[persona.icon as keyof typeof iconMap] || User
            return (
              <Card key={persona.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{persona.title}</CardTitle>
                        <CardDescription className="text-sm">{persona.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{persona.questions.length} Questions</Badge>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingPersona(persona)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          {editingPersona && (
                            <EditPersonaDialog
                              persona={editingPersona}
                              onSubmit={(updates) => handleUpdatePersona(editingPersona.id, updates)}
                              onCancel={() => setEditingPersona(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePersona(persona.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreatePersonaDialog({ onSubmit }: { onSubmit: (data: Omit<PersonaConfig, "id">) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "User",
    questions: [""],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const validQuestions = formData.questions.filter((q) => q.trim())
    if (validQuestions.length === 0) {
      alert("Please add at least one question")
      return
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      questions: validQuestions,
    })

    // Reset form
    setFormData({
      title: "",
      description: "",
      icon: "User",
      questions: [""],
    })
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }))
  }

  const updateQuestion = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? value : q)),
    }))
  }

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }))
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Persona</DialogTitle>
        <DialogDescription>Add a new persona with custom questions for your assessment</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Software Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-sm font-semibold text-gray-500">{category}</div>
                    {icons.map((iconName) => {
                      const IconComponent = iconMap[iconName as keyof typeof iconMap]
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {iconName}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this role..."
          />
        </div>

        <div className="space-y-2">
          <Label>Questions *</Label>
          {formData.questions.map((question, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder={`Question ${index + 1}...`}
                className="flex-1"
              />
              {formData.questions.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeQuestion(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Create Persona</Button>
        </div>
      </form>
    </>
  )
}

function EditPersonaDialog({
  persona,
  onSubmit,
  onCancel,
}: {
  persona: PersonaConfig
  onSubmit: (updates: Partial<PersonaConfig>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: persona.title,
    description: persona.description,
    icon: persona.icon,
    questions: [...persona.questions],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const validQuestions = formData.questions.filter((q) => q.trim())
    if (validQuestions.length === 0) {
      alert("Please add at least one question")
      return
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      questions: validQuestions,
    })
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }))
  }

  const updateQuestion = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? value : q)),
    }))
  }

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }))
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Persona</DialogTitle>
        <DialogDescription>Update the persona details and questions</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Software Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-icon">Icon</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-sm font-semibold text-gray-500">{category}</div>
                    {icons.map((iconName) => {
                      const IconComponent = iconMap[iconName as keyof typeof iconMap]
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {iconName}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Description *</Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of this role..."
          />
        </div>

        <div className="space-y-2">
          <Label>Questions *</Label>
          {formData.questions.map((question, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder={`Question ${index + 1}...`}
                className="flex-1"
              />
              {formData.questions.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => removeQuestion(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Update Persona</Button>
        </div>
      </form>
    </>
  )
}
