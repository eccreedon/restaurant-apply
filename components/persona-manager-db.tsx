"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Edit, Trash2, X } from "lucide-react"
import {
  getAllPersonasFromDB,
  createPersonaInDB,
  updatePersonaInDB,
  deletePersonaFromDB,
  type PersonaConfig,
} from "@/lib/persona-db"

interface PersonaManagerDBProps {
  onPersonasChange?: () => void
}

const ICON_CATEGORIES = {
  Technology: ["💻", "⚡", "🔧", "🖥️", "📱", "🔌", "⚙️", "🛠️", "💾", "🖨️", "📡", "🔋"],
  Business: ["💼", "📊", "💰", "📈", "🏢", "📋", "📝", "💳", "🎯", "📞", "✉️", "🗂️"],
  Creative: ["🎨", "✏️", "📐", "🖌️", "📷", "🎭", "🎪", "🎬", "🎵", "📚", "✨", "🌈"],
  Healthcare: ["🏥", "💊", "🩺", "❤️", "🧬", "🔬", "💉", "🦷", "👁️", "🧠", "🫀", "🩹"],
  Education: ["🎓", "📚", "✏️", "🔍", "📖", "🧮", "🗣️", "👨‍🏫", "👩‍🎓", "📝", "💡", "🎯"],
  "Food Service": [
    "👨‍🍳",
    "🍽️",
    "🍕",
    "🥘",
    "🍷",
    "☕",
    "🥐",
    "🍩",
    "🍪",
    "🥩",
    "🐟",
    "🥕",
    "🌾",
    "🥗",
    "🍌",
    "🍇",
    "🍒",
    "🥛",
    "🥚",
    "🧀",
    "🍞",
    "🥖",
    "🍰",
  ],
}

const COLOR_OPTIONS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-rose-500",
]

export function PersonaManagerDB({ onPersonasChange }: PersonaManagerDBProps) {
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<PersonaConfig | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
    color: "bg-blue-500",
    questions: [""],
  })

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    setIsLoading(true)
    try {
      const data = await getAllPersonasFromDB()
      setPersonas(data)
    } catch (error) {
      console.error("Error loading personas:", error)
      toast({
        title: "Error",
        description: "Failed to load personas from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "",
      color: "bg-blue-500",
      questions: [""],
    })
  }

  const handleCreatePersona = async () => {
    if (!formData.title.trim() || !formData.icon || formData.questions.some((q) => !q.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const newPersona = await createPersonaInDB({
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        questions: formData.questions.filter((q) => q.trim()).map((q) => q.trim()),
      })

      if (newPersona) {
        setPersonas([newPersona, ...personas])
        resetForm()
        setIsCreateDialogOpen(false)
        onPersonasChange?.()
        toast({
          title: "Success",
          description: "Persona created successfully",
        })
      }
    } catch (error) {
      console.error("Error creating persona:", error)
      toast({
        title: "Error",
        description: "Failed to create persona",
        variant: "destructive",
      })
    }
  }

  const handleEditPersona = (persona: PersonaConfig) => {
    setEditingPersona(persona)
    setFormData({
      title: persona.title,
      description: persona.description,
      icon: persona.icon,
      color: persona.color,
      questions: [...persona.questions],
    })
  }

  const handleUpdatePersona = async () => {
    if (!editingPersona || !formData.title.trim() || !formData.icon || formData.questions.some((q) => !q.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedPersona = await updatePersonaInDB(editingPersona.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        questions: formData.questions.filter((q) => q.trim()).map((q) => q.trim()),
      })

      if (updatedPersona) {
        setPersonas(personas.map((p) => (p.id === editingPersona.id ? updatedPersona : p)))
        resetForm()
        setEditingPersona(null)
        onPersonasChange?.()
        toast({
          title: "Success",
          description: "Persona updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating persona:", error)
      toast({
        title: "Error",
        description: "Failed to update persona",
        variant: "destructive",
      })
    }
  }

  const handleDeletePersona = async (personaId: string) => {
    try {
      const success = await deletePersonaFromDB(personaId)
      if (success) {
        setPersonas(personas.filter((p) => p.id !== personaId))
        onPersonasChange?.()
        toast({
          title: "Success",
          description: "Persona deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting persona:", error)
      toast({
        title: "Error",
        description: "Failed to delete persona",
        variant: "destructive",
      })
    }
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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Manage Personas</h3>
          <p className="text-slate-600">Create and edit the roles available in your assessment</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
            </DialogHeader>
            <PersonaForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreatePersona}
              onCancel={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              submitLabel="Create Persona"
            />
          </DialogContent>
        </Dialog>
      </div>

      {personas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h4 className="text-lg font-semibold mb-2">No Personas Yet</h4>
            <p className="text-slate-600 mb-4">Create your first persona to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Persona
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${persona.color} rounded-lg flex items-center justify-center text-white text-lg`}
                    >
                      {persona.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{persona.title}</CardTitle>
                      <p className="text-sm text-slate-600">{persona.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="secondary">{persona.questions.length} questions</Badge>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPersona(persona)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{persona.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePersona(persona.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPersona} onOpenChange={(open) => !open && setEditingPersona(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Persona</DialogTitle>
          </DialogHeader>
          <PersonaForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdatePersona}
            onCancel={() => {
              setEditingPersona(null)
              resetForm()
            }}
            addQuestion={addQuestion}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
            submitLabel="Update Persona"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PersonaFormProps {
  formData: {
    title: string
    description: string
    icon: string
    color: string
    questions: string[]
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      icon: string
      color: string
      questions: string[]
    }>
  >
  onSubmit: () => void
  onCancel: () => void
  addQuestion: () => void
  updateQuestion: (index: number, value: string) => void
  removeQuestion: (index: number) => void
  submitLabel: string
}

function PersonaForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  addQuestion,
  updateQuestion,
  removeQuestion,
  submitLabel,
}: PersonaFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Line Cook"
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={formData.color} onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_OPTIONS.map((color) => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${color} rounded`}></div>
                    {color.replace("bg-", "").replace("-500", "")}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this role"
        />
      </div>

      <div>
        <Label>Icon</Label>
        <div className="space-y-4">
          {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-slate-700 mb-2">{category}</h4>
              <div className="grid grid-cols-12 gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center text-lg hover:bg-slate-50 ${
                      formData.icon === icon ? "border-blue-500 bg-blue-50" : "border-slate-200"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Questions</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>
        <div className="space-y-3">
          {formData.questions.map((question, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder={`Question ${index + 1}`}
                className="flex-1"
              />
              {formData.questions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
