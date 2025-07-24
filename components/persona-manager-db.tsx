"use client"

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
import { Plus, Edit, Trash2, User } from "lucide-react"
import {
  getAllPersonasFromDB,
  createPersonaInDB,
  updatePersonaInDB,
  deletePersonaFromDB,
  iconMap,
  type PersonaConfig,
} from "@/lib/persona-db"
import { toast } from "@/hooks/use-toast"

interface PersonaManagerDBProps {
  onPersonasChange?: () => void
}

const iconCategories = {
  General: ["User", "UserCheck", "Settings", "Briefcase", "GraduationCap"],
  "Food Service": [
    "ChefHat",
    "UtensilsCrossed",
    "Utensils",
    "Wine",
    "Coffee",
    "Pizza",
    "Soup",
    "CakeSlice",
    "IceCream",
    "Sandwich",
    "Apple",
    "Grape",
    "Cherry",
    "Banana",
    "Milk",
    "Egg",
    "Carrot",
    "Croissant",
    "Donut",
    "Cookie",
    "Beef",
    "Fish",
    "Wheat",
    "Salad",
  ],
  Healthcare: ["Heart", "Shield", "Stethoscope", "Microscope"],
  Technology: ["Smartphone", "Laptop", "Database", "Server", "Cloud", "Wifi"],
  Creative: ["Palette", "Music", "Camera", "Paintbrush", "PenTool"],
  Business: ["DollarSign", "TrendingUp", "BarChart", "PieChart", "Calculator"],
  Tools: ["Wrench", "Hammer", "Scissors"],
  Communication: ["Mail", "Phone", "MessageCircle", "Video"],
  Other: [
    "Home",
    "Building",
    "Car",
    "Plane",
    "TreePine",
    "Flower",
    "Sun",
    "Moon",
    "Star",
    "Zap",
    "Target",
    "Trophy",
    "Gift",
    "Bell",
    "Clock",
    "Calendar",
    "MapPin",
    "Globe",
    "Book",
    "Scale",
    "Lock",
    "Key",
    "Eye",
    "Search",
  ],
}

const colorOptions = [
  { value: "bg-blue-500", label: "Blue", color: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", color: "bg-green-500" },
  { value: "bg-purple-500", label: "Purple", color: "bg-purple-500" },
  { value: "bg-red-500", label: "Red", color: "bg-red-500" },
  { value: "bg-yellow-500", label: "Yellow", color: "bg-yellow-500" },
  { value: "bg-pink-500", label: "Pink", color: "bg-pink-500" },
  { value: "bg-indigo-500", label: "Indigo", color: "bg-indigo-500" },
  { value: "bg-gray-500", label: "Gray", color: "bg-gray-500" },
  { value: "bg-orange-500", label: "Orange", color: "bg-orange-500" },
  { value: "bg-teal-500", label: "Teal", color: "bg-teal-500" },
]

export function PersonaManagerDB({ onPersonasChange }: PersonaManagerDBProps) {
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<PersonaConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "User",
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
        description: "Failed to load personas",
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
      icon: "User",
      color: "bg-blue-500",
      questions: [""],
    })
  }

  const handleCreatePersona = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const validQuestions = formData.questions.filter((q) => q.trim())
    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question",
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
        questions: validQuestions,
      })

      if (newPersona) {
        await loadPersonas()
        onPersonasChange?.()
        setIsCreateDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Persona created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create persona",
          variant: "destructive",
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
      questions: persona.questions.length > 0 ? persona.questions : [""],
    })
  }

  const handleUpdatePersona = async () => {
    if (!editingPersona) return

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const validQuestions = formData.questions.filter((q) => q.trim())
    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question",
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
        questions: validQuestions,
      })

      if (updatedPersona) {
        await loadPersonas()
        onPersonasChange?.()
        setEditingPersona(null)
        resetForm()
        toast({
          title: "Success",
          description: "Persona updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update persona",
          variant: "destructive",
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

  const handleDeletePersona = async (id: string) => {
    try {
      const success = await deletePersonaFromDB(id)
      if (success) {
        await loadPersonas()
        onPersonasChange?.()
        toast({
          title: "Success",
          description: "Persona deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete persona",
          variant: "destructive",
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
    setFormData({
      ...formData,
      questions: [...formData.questions, ""],
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

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        questions: newQuestions,
      })
    }
  }

  const renderPersonaForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Line Cook, Server, Manager"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this role..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {Object.entries(iconCategories).map(([category, icons]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">{category}</div>
                  {icons.map((iconName) => {
                    const IconComponent = iconMap[iconName as keyof typeof iconMap] || User
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
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

        <div className="space-y-2">
          <Label>Color</Label>
          <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${color.color}`} />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Questions *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>
        {formData.questions.map((question, index) => (
          <div key={index} className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder={`Question ${index + 1}...`}
              rows={2}
              className="flex-1"
            />
            {formData.questions.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeQuestion(index)}
                className="self-start mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false)
            setEditingPersona(null)
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button onClick={editingPersona ? handleUpdatePersona : handleCreatePersona}>
          {editingPersona ? "Update" : "Create"} Persona
        </Button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading personas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Personas</h2>
          <p className="text-gray-600">Create and manage different roles for your assessments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
              <DialogDescription>Create a new role with custom questions for your assessment</DialogDescription>
            </DialogHeader>
            {renderPersonaForm()}
          </DialogContent>
        </Dialog>
      </div>

      {personas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No personas yet</h3>
            <p className="text-gray-600 mb-4">Create your first persona to get started with assessments</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Persona
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => {
            const IconComponent = iconMap[persona.icon as keyof typeof iconMap] || User
            return (
              <Card key={persona.id} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${persona.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{persona.title}</CardTitle>
                      <CardDescription className="text-sm">{persona.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{persona.questions.length} questions</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog
                        open={editingPersona?.id === persona.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingPersona(null)
                            resetForm()
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEditPersona(persona)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Persona</DialogTitle>
                            <DialogDescription>Update the persona details and questions</DialogDescription>
                          </DialogHeader>
                          {renderPersonaForm()}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
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
                            <AlertDialogAction onClick={() => handleDeletePersona(persona.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
