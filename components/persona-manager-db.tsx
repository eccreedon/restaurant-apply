"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Code,
  Palette,
  Users,
  TrendingUp,
  Megaphone,
  Briefcase,
  Heart,
  Shield,
  Zap,
  Target,
  Globe,
  Brain,
  Calculator,
  Camera,
  Car,
  Coffee,
  Database,
  DollarSign,
  FileText,
  Headphones,
  Home,
  Laptop,
  Lock,
  Mail,
  MapPin,
  Music,
  Phone,
  PieChart,
  Rocket,
  Search,
  Settings,
  Smartphone,
  Star,
  PenToolIcon as Tool,
  Trophy,
  Truck,
  Umbrella,
  Video,
  Wifi,
  Wrench,
  BookOpen,
  Building,
  Calendar,
  Clock,
  Cloud,
  Compass,
  Crown,
  Diamond,
  Eye,
  Flag,
  Gift,
  Lightbulb,
  Medal,
  Mountain,
  Paintbrush,
  Puzzle,
  Sparkles,
  Sword,
  Telescope,
  Thermometer,
  Waves,
  Gamepad2,
  GraduationCap,
  Handshake,
  BarChart3,
  LineChart,
  Activity,
  Atom,
  Beaker,
  Binary,
  Bug,
  BarChartIcon as ChartBar,
  Cog,
  Command,
  Cpu,
  CreditCard,
  FlaskConical,
  Gauge,
  GitBranch,
  HardDrive,
  Layers,
  Monitor,
  Network,
  Package,
  Server,
  Terminal,
  Workflow,
  Loader2,
  ChefHat,
  UtensilsCrossed,
  Utensils,
  Wine,
  CakeSlice,
  IceCream,
  Pizza,
  Soup,
  Salad,
  Sandwich,
  Beef,
  Fish,
  Wheat,
  Apple,
  Grape,
  Cherry,
  Banana,
  Carrot,
  Milk,
  Egg,
  Croissant,
  Donut,
  Cookie,
} from "lucide-react"
import { loadPersonasFromDB, savePersonaToDB, deletePersonaFromDB } from "@/lib/persona-db"
import type { PersonaConfig } from "@/app/page"

// Expanded icon collection with Food Service & Hospitality
const availableIcons = [
  // Professional & Business
  { name: "Briefcase", component: Briefcase, category: "Professional" },
  { name: "Users", component: Users, category: "Professional" },
  { name: "TrendingUp", component: TrendingUp, category: "Professional" },
  { name: "Building", component: Building, category: "Professional" },
  { name: "Handshake", component: Handshake, category: "Professional" },
  { name: "Crown", component: Crown, category: "Professional" },
  { name: "Trophy", component: Trophy, category: "Professional" },
  { name: "Medal", component: Medal, category: "Professional" },
  { name: "Target", component: Target, category: "Professional" },
  { name: "Flag", component: Flag, category: "Professional" },

  // Technology & Development
  { name: "Code", component: Code, category: "Technology" },
  { name: "Laptop", component: Laptop, category: "Technology" },
  { name: "Monitor", component: Monitor, category: "Technology" },
  { name: "Database", component: Database, category: "Technology" },
  { name: "Server", component: Server, category: "Technology" },
  { name: "Terminal", component: Terminal, category: "Technology" },
  { name: "GitBranch", component: GitBranch, category: "Technology" },
  { name: "Bug", component: Bug, category: "Technology" },
  { name: "Cpu", component: Cpu, category: "Technology" },
  { name: "HardDrive", component: HardDrive, category: "Technology" },
  { name: "Network", component: Network, category: "Technology" },
  { name: "Binary", component: Binary, category: "Technology" },
  { name: "Command", component: Command, category: "Technology" },
  { name: "Package", component: Package, category: "Technology" },
  { name: "Layers", component: Layers, category: "Technology" },
  { name: "Workflow", component: Workflow, category: "Technology" },

  // Creative & Design
  { name: "Palette", component: Palette, category: "Creative" },
  { name: "Paintbrush", component: Paintbrush, category: "Creative" },
  { name: "Camera", component: Camera, category: "Creative" },
  { name: "Video", component: Video, category: "Creative" },
  { name: "Music", component: Music, category: "Creative" },
  { name: "Headphones", component: Headphones, category: "Creative" },
  { name: "Eye", component: Eye, category: "Creative" },
  { name: "Sparkles", component: Sparkles, category: "Creative" },
  { name: "Diamond", component: Diamond, category: "Creative" },
  { name: "Star", component: Star, category: "Creative" },

  // Communication & Marketing
  { name: "Megaphone", component: Megaphone, category: "Communication" },
  { name: "Mail", component: Mail, category: "Communication" },
  { name: "Phone", component: Phone, category: "Communication" },
  { name: "Smartphone", component: Smartphone, category: "Communication" },
  { name: "Wifi", component: Wifi, category: "Communication" },
  { name: "Globe", component: Globe, category: "Communication" },

  // Analytics & Data
  { name: "BarChart3", component: BarChart3, category: "Analytics" },
  { name: "LineChart", component: LineChart, category: "Analytics" },
  { name: "PieChart", component: PieChart, category: "Analytics" },
  { name: "ChartBar", component: ChartBar, category: "Analytics" },
  { name: "Activity", component: Activity, category: "Analytics" },
  { name: "Gauge", component: Gauge, category: "Analytics" },
  { name: "Calculator", component: Calculator, category: "Analytics" },

  // Science & Research
  { name: "Brain", component: Brain, category: "Science" },
  { name: "Atom", component: Atom, category: "Science" },
  { name: "Beaker", component: Beaker, category: "Science" },
  { name: "FlaskConical", component: FlaskConical, category: "Science" },
  { name: "Telescope", component: Telescope, category: "Science" },
  { name: "Thermometer", component: Thermometer, category: "Science" },

  // Education & Learning
  { name: "GraduationCap", component: GraduationCap, category: "Education" },
  { name: "BookOpen", component: BookOpen, category: "Education" },
  { name: "Lightbulb", component: Lightbulb, category: "Education" },
  { name: "Puzzle", component: Puzzle, category: "Education" },

  // Tools & Utilities
  { name: "Tool", component: Tool, category: "Tools" },
  { name: "Wrench", component: Wrench, category: "Tools" },
  { name: "Settings", component: Settings, category: "Tools" },
  { name: "Cog", component: Cog, category: "Tools" },
  { name: "Search", component: Search, category: "Tools" },

  // Finance & Business
  { name: "DollarSign", component: DollarSign, category: "Finance" },
  { name: "CreditCard", component: CreditCard, category: "Finance" },

  // Food Service & Hospitality - NEW CATEGORY
  { name: "ChefHat", component: ChefHat, category: "Food Service" },
  { name: "UtensilsCrossed", component: UtensilsCrossed, category: "Food Service" },
  { name: "Utensils", component: Utensils, category: "Food Service" },
  { name: "Wine", component: Wine, category: "Food Service" },
  { name: "Coffee", component: Coffee, category: "Food Service" },
  { name: "CakeSlice", component: CakeSlice, category: "Food Service" },
  { name: "Pizza", component: Pizza, category: "Food Service" },
  { name: "Soup", component: Soup, category: "Food Service" },
  { name: "IceCream", component: IceCream, category: "Food Service" },
  { name: "Sandwich", component: Sandwich, category: "Food Service" },
  { name: "Apple", component: Apple, category: "Food Service" },
  { name: "Grape", component: Grape, category: "Food Service" },
  { name: "Cherry", component: Cherry, category: "Food Service" },
  { name: "Banana", component: Banana, category: "Food Service" },
  { name: "Milk", component: Milk, category: "Food Service" },
  { name: "Croissant", component: Croissant, category: "Food Service" },
  { name: "Donut", component: Donut, category: "Food Service" },
  { name: "Cookie", component: Cookie, category: "Food Service" },
  { name: "Beef", component: Beef, category: "Food Service" },
  { name: "Fish", component: Fish, category: "Food Service" },
  { name: "Wheat", component: Wheat, category: "Food Service" },
  { name: "Salad", component: Salad, category: "Food Service" },
  { name: "Egg", component: Egg, category: "Food Service" },
  { name: "Carrot", component: Carrot, category: "Food Service" },

  // General & Lifestyle
  { name: "Heart", component: Heart, category: "General" },
  { name: "Shield", component: Shield, category: "General" },
  { name: "Zap", component: Zap, category: "General" },
  { name: "Car", component: Car, category: "General" },
  { name: "Truck", component: Truck, category: "General" },
  { name: "Home", component: Home, category: "General" },
  { name: "MapPin", component: MapPin, category: "General" },
  { name: "Calendar", component: Calendar, category: "General" },
  { name: "Clock", component: Clock, category: "General" },
  { name: "Cloud", component: Cloud, category: "General" },
  { name: "Compass", component: Compass, category: "General" },
  { name: "Gift", component: Gift, category: "General" },
  { name: "Lock", component: Lock, category: "General" },
  { name: "Mountain", component: Mountain, category: "General" },
  { name: "Rocket", component: Rocket, category: "General" },
  { name: "Sword", component: Sword, category: "General" },
  { name: "Umbrella", component: Umbrella, category: "General" },
  { name: "Waves", component: Waves, category: "General" },
  { name: "Gamepad2", component: Gamepad2, category: "General" },
  { name: "FileText", component: FileText, category: "General" },
]

const availableColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-sky-500",
  "bg-slate-500",
  "bg-gray-500",
  "bg-zinc-500",
]

// Group icons by category for better organization
const iconsByCategory = availableIcons.reduce(
  (acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = []
    }
    acc[icon.category].push(icon)
    return acc
  },
  {} as Record<string, typeof availableIcons>,
)

export function PersonaManagerDB() {
  const [personas, setPersonas] = useState<PersonaConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<{ personaId: string; questionIndex: number } | null>(null)
  const [tempQuestion, setTempQuestion] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPersonaForEdit, setSelectedPersonaForEdit] = useState<PersonaConfig | null>(null)
  const { toast } = useToast()

  // Load personas from database on component mount
  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    setLoading(true)
    try {
      const loadedPersonas = await loadPersonasFromDB()
      setPersonas(loadedPersonas)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load personas from database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuestion = (personaId: string, questionIndex: number) => {
    const persona = personas.find((p) => p.id === personaId)
    if (persona) {
      setEditingQuestion({ personaId, questionIndex })
      setTempQuestion(persona.questions[questionIndex])
    }
  }

  const handleSaveQuestion = async () => {
    if (editingQuestion) {
      const persona = personas.find((p) => p.id === editingQuestion.personaId)
      if (persona) {
        const updatedQuestions = [...persona.questions]
        updatedQuestions[editingQuestion.questionIndex] = tempQuestion
        const updatedPersona = { ...persona, questions: updatedQuestions }

        const success = await savePersonaToDB(updatedPersona)
        if (success) {
          setPersonas((prev) => prev.map((p) => (p.id === persona.id ? updatedPersona : p)))
          setEditingQuestion(null)
          setTempQuestion("")
          toast({
            title: "Success",
            description: "Question updated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to update question",
            variant: "destructive",
          })
        }
      }
    }
  }

  const handleCancelEditQuestion = () => {
    setEditingQuestion(null)
    setTempQuestion("")
  }

  const handleDeleteQuestion = async (personaId: string, questionIndex: number) => {
    const persona = personas.find((p) => p.id === personaId)
    if (persona) {
      const updatedQuestions = persona.questions.filter((_, index) => index !== questionIndex)
      const updatedPersona = { ...persona, questions: updatedQuestions }

      const success = await savePersonaToDB(updatedPersona)
      if (success) {
        setPersonas((prev) => prev.map((p) => (p.id === persona.id ? updatedPersona : p)))
        toast({
          title: "Success",
          description: "Question deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete question",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddQuestion = async (personaId: string) => {
    const persona = personas.find((p) => p.id === personaId)
    if (persona) {
      const updatedQuestions = [...persona.questions, "New question - click to edit"]
      const updatedPersona = { ...persona, questions: updatedQuestions }

      const success = await savePersonaToDB(updatedPersona)
      if (success) {
        setPersonas((prev) => prev.map((p) => (p.id === persona.id ? updatedPersona : p)))
        toast({
          title: "Success",
          description: "Question added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add question",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeletePersona = async (personaId: string) => {
    const success = await deletePersonaFromDB(personaId)
    if (success) {
      setPersonas((prev) => prev.filter((p) => p.id !== personaId))
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
  }

  const handleEditPersona = (persona: PersonaConfig) => {
    setSelectedPersonaForEdit(persona)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading personas from database...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personas">Manage Personas</TabsTrigger>
          <TabsTrigger value="questions">Edit Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Persona Management</h2>
              <p className="text-slate-600">Create, edit, and delete assessment personas (stored in database)</p>
            </div>
            <CreatePersonaDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onPersonaCreated={async (newPersona) => {
                const success = await savePersonaToDB(newPersona)
                if (success) {
                  setPersonas((prev) => [...prev, newPersona])
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
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {personas.map((persona) => {
              const IconComponent = availableIcons.find((icon) => icon.name === persona.icon)?.component || Code
              return (
                <Card key={persona.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${persona.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{persona.title}</CardTitle>
                        <p className="text-sm text-slate-600">{persona.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{persona.questions.length} questions</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditPersona(persona)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{persona.title}"? This action cannot be undone and will
                                remove all associated questions.
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

          <EditPersonaDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            persona={selectedPersonaForEdit}
            onPersonaUpdated={async (updatedPersona) => {
              const success = await savePersonaToDB(updatedPersona)
              if (success) {
                setPersonas((prev) => prev.map((p) => (p.id === updatedPersona.id ? updatedPersona : p)))
                setSelectedPersonaForEdit(null)
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
            }}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Question Management</h2>
            <p className="text-slate-600">Edit questions for each persona (changes saved to database)</p>
          </div>

          {personas.map((persona) => {
            const IconComponent = availableIcons.find((icon) => icon.name === persona.icon)?.component || Code
            return (
              <Card key={persona.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${persona.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle>{persona.title}</CardTitle>
                        <p className="text-sm text-slate-600">{persona.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{persona.questions.length} questions</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {persona.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Q{index + 1}
                            </Badge>
                          </div>
                          {editingQuestion?.personaId === persona.id && editingQuestion?.questionIndex === index ? (
                            <div className="space-y-3">
                              <Textarea
                                value={tempQuestion}
                                onChange={(e) => setTempQuestion(e.target.value)}
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveQuestion}>
                                  <Save className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEditQuestion}>
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-700 leading-relaxed">{question}</p>
                          )}
                        </div>
                        {!(editingQuestion?.personaId === persona.id && editingQuestion?.questionIndex === index) && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEditQuestion(persona.id, index)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(persona.id, index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="dashed" className="w-full" onClick={() => handleAddQuestion(persona.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Dialog components
function CreatePersonaDialog({
  isOpen,
  onOpenChange,
  onPersonaCreated,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPersonaCreated: (persona: PersonaConfig) => void
}) {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    icon: "Code",
    color: "bg-blue-500",
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("Professional")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.id && formData.title && formData.description) {
      const newPersona: PersonaConfig = {
        ...formData,
        questions: [
          "Tell me about your experience in this field.",
          "What are your key strengths?",
          "Describe a challenging situation you've handled.",
        ],
      }

      onPersonaCreated(newPersona)
      setFormData({ id: "", title: "", description: "", icon: "Code", color: "bg-blue-500" })
      onOpenChange(false)
    }
  }

  const IconComponent = availableIcons.find((icon) => icon.name === formData.icon)?.component || Code

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">Persona ID</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="e.g., data-scientist"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Data Scientist"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this persona assesses"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(iconsByCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({iconsByCategory[category].length})
                    </SelectItem>
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
                  {availableColors.map((color) => (
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

          <div className="space-y-2">
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {iconsByCategory[selectedCategory]?.map((icon) => {
                const Icon = icon.component
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.name })}
                    className={`p-2 rounded-lg border-2 transition-colors hover:bg-slate-50 ${
                      formData.icon === icon.name ? "border-blue-500 bg-blue-50" : "border-slate-200"
                    }`}
                    title={icon.name}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-500">
              Showing {iconsByCategory[selectedCategory]?.length || 0} icons in {selectedCategory} category
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className={`w-8 h-8 ${formData.color} rounded-lg flex items-center justify-center`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium">{formData.title || "Preview"}</p>
              <p className="text-sm text-slate-600">{formData.description || "Description preview"}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Persona</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditPersonaDialog({
  isOpen,
  onOpenChange,
  persona,
  onPersonaUpdated,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  persona: PersonaConfig | null
  onPersonaUpdated: (persona: PersonaConfig) => void
}) {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    icon: "Code",
    color: "bg-blue-500",
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("Professional")

  // Update form data when persona changes
  React.useEffect(() => {
    if (persona) {
      setFormData({
        id: persona.id,
        title: persona.title,
        description: persona.description,
        icon: persona.icon,
        color: persona.color,
      })
      // Find the category of the current icon
      const iconCategory = availableIcons.find((icon) => icon.name === persona.icon)?.category || "Professional"
      setSelectedCategory(iconCategory)
    }
  }, [persona])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (persona && formData.id && formData.title && formData.description) {
      const updatedPersona: PersonaConfig = {
        ...formData,
        questions: persona.questions, // Keep existing questions
      }

      onPersonaUpdated(updatedPersona)
      onOpenChange(false)
    }
  }

  const IconComponent = availableIcons.find((icon) => icon.name === formData.icon)?.component || Code

  if (!persona) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Persona</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-id">Persona ID</Label>
            <Input
              id="edit-id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(iconsByCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({iconsByCategory[category].length})
                    </SelectItem>
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
                  {availableColors.map((color) => (
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

          <div className="space-y-2">
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {iconsByCategory[selectedCategory]?.map((icon) => {
                const Icon = icon.component
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.name })}
                    className={`p-2 rounded-lg border-2 transition-colors hover:bg-slate-50 ${
                      formData.icon === icon.name ? "border-blue-500 bg-blue-50" : "border-slate-200"
                    }`}
                    title={icon.name}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-500">
              Showing {iconsByCategory[selectedCategory]?.length || 0} icons in {selectedCategory} category
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className={`w-8 h-8 ${formData.color} rounded-lg flex items-center justify-center`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium">{formData.title}</p>
              <p className="text-sm text-slate-600">{formData.description}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Persona</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
