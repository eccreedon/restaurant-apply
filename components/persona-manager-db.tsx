"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

interface PersonaManagerDBProps {
  onPersonasChange?: () => void
}

export function PersonaManagerDB({ onPersonasChange }: PersonaManagerDBProps) {
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<PersonaConfig | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "User",
    color: "bg-blue-500",
    questions: [""],
  })

  const iconCategories = {
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
    Technology: ["Code", "Smartphone", "Laptop", "Database", "Settings", "Zap", "Globe"],
    Business: ["Briefcase", "Calculator", "BarChart", "TrendingUp", "Target", "ShoppingCart", "Building"],
    Creative: ["Palette", "Camera", "Music", "Gamepad2", "Lightbulb"],
    Healthcare: ["Stethoscope", "Heart", "Brain", "Eye", "Ear"],
    Education: ["GraduationCap"],
    Industrial: ["Wrench", "Truck"],
    Communication: ["MessageCircle", "Phone", "Mail"],
    Achievement: ["Award", "Star", "Crown", "Gem", "Rocket", "Shield"],
    General: ["User"],
  }

  const colorOptions = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-gray-500",
  ]

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    setIsLoading(true)
    try {
      const personaData = await getAllPersonasFromDB()
      setPersonas(personaData)
    } catch (error) {
      console.error("Error loading personas:", error)
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
    if (!formData.title.trim() || !formData.description.trim()) return

    const filteredQuestions = formData.questions.filter((q) => q.trim())
    if (filteredQuestions.length === 0) return

    try {
      const newPersona = await createPersonaInDB({
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        questions: filteredQuestions,
      })

      if (newPersona) {
        await loadPersonas()
        onPersonasChange?.()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating persona:", error)
    }
  }

  const handleEditPersona = async () => {
    if (!editingPersona || !formData.title.trim() || !formData.description.trim()) return

    const filteredQuestions = formData.questions.filter((q) => q.trim())
    if (filteredQuestions.length === 0) return

    try {
      const updatedPersona = await updatePersonaInDB(editingPersona.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        questions: filteredQuestions,
      })

      if (updatedPersona) {
        await loadPersonas()
        onPersonasChange?.()
        setIsEditDialogOpen(false)
        setEditingPersona(null)
        resetForm()
      }
    } catch (error) {
      console.error("Error updating persona:", error)
    }
  }

  const handleDeletePersona = async (id: string) => {
    try {
      const success = await deletePersonaFromDB(id)
      if (success) {
        await loadPersonas()
        onPersonasChange?.()
      }
    } catch (error) {
      console.error("Error deleting persona:", error)
    }
  }

  const openEditDialog = (persona: PersonaConfig) => {
    setEditingPersona(persona)
    setFormData({
      title: persona.title,
      description: persona.description,
      icon: persona.icon,
      color: persona.color,
      questions: persona.questions.length > 0 ? persona.questions : [""],
    })
    setIsEditDialogOpen(true)
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading personas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Personas</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Line Cook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color}`}></div>
                            {color.replace("bg-", "").replace("-500", "")}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this role..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Object.entries(iconCategories).map(([category, icons]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-sm font-semibold text-gray-500">{category}</div>
                        {icons.map((iconName) => {
                          const IconComponent = iconMap[iconName as keyof typeof iconMap] || User
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

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    Add Question
                  </Button>
                </div>
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
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePersona}>Create Persona</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {personas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No personas created yet</p>
            <p className="text-sm text-gray-500">Create your first persona to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => {
            const IconComponent = iconMap[persona.icon as keyof typeof iconMap] || User
            return (
              <Card key={persona.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${persona.color} rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{persona.title}</CardTitle>
                        <p className="text-sm text-gray-600">{persona.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{persona.questions.length} questions</Badge>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(persona)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Persona</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Line Cook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color}`}></div>
                          {color.replace("bg-", "").replace("-500", "")}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this role..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Object.entries(iconCategories).map(([category, icons]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-500">{category}</div>
                      {icons.map((iconName) => {
                        const IconComponent = iconMap[iconName as keyof typeof iconMap] || User
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Questions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  Add Question
                </Button>
              </div>
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
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPersona}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
