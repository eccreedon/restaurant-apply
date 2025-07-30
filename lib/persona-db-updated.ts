import { supabase } from "./supabase"
import {
  Code,
  Palette,
  Users,
  TrendingUp,
  Megaphone,
  ChefHat,
  Coffee,
  ShoppingCart,
  Utensils,
  Clock,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Briefcase,
  Settings,
  Globe,
  Camera,
  Music,
  Book,
  Lightbulb,
  Shield,
  Truck,
  Home,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

export const iconMap = {
  Code,
  Palette,
  Users,
  TrendingUp,
  Megaphone,
  ChefHat,
  Coffee,
  ShoppingCart,
  Utensils,
  Clock,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Briefcase,
  Settings,
  Globe,
  Camera,
  Music,
  Book,
  Lightbulb,
  Shield,
  Truck,
  Home,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
}

export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  color: string
  image?: string
  questions: string[]
  created_at?: string
  updated_at?: string
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")

    // Get personas basic info
    const { data: personasData, error: personasError } = await supabase
      .from("personas")
      .select("*")
      .order("created_at", { ascending: true })

    if (personasError) {
      console.error("Supabase error fetching personas:", personasError)
      throw personasError
    }

    if (!personasData || personasData.length === 0) {
      console.log("No personas found")
      return []
    }

    // Get questions for each persona from the new persona_questions table
    const personasWithQuestions: PersonaConfig[] = []

    for (const persona of personasData) {
      const { data: questionsData, error: questionsError } = await supabase
        .from("persona_questions")
        .select("question_text")
        .eq("persona_id", persona.id)
        .order("question_number", { ascending: true })

      if (questionsError) {
        console.error(`Error fetching questions for persona ${persona.id}:`, questionsError)
        // Continue with empty questions array if there's an error
        personasWithQuestions.push({
          ...persona,
          questions: [],
        })
        continue
      }

      const questions = questionsData?.map((q) => q.question_text) || []

      personasWithQuestions.push({
        ...persona,
        questions: questions,
      })

      console.log(`Persona ${persona.title}: loaded ${questions.length} questions`)
    }

    console.log(`Fetched ${personasWithQuestions.length} personas with questions`)
    return personasWithQuestions
  } catch (error) {
    console.error("Error fetching personas:", error)
    return []
  }
}

export async function createPersonaInDB(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig> {
  const { data, error } = await supabase
    .from("personas")
    .insert([
      {
        title: persona.title,
        description: persona.description,
        icon: persona.icon,
        color: persona.color,
        image: persona.image,
        questions: persona.questions,
      },
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  // Also create individual question records
  if (persona.questions && persona.questions.length > 0) {
    const questionRecords = persona.questions.map((question, index) => ({
      persona_id: data.id,
      question_text: question,
      question_number: index + 1,
    }))

    const { error: questionsError } = await supabase.from("persona_questions").insert(questionRecords)

    if (questionsError) {
      console.error("Error creating persona questions:", questionsError)
    }
  }

  return data
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig> {
  const { data, error } = await supabase
    .from("personas")
    .update({
      title: updates.title,
      description: updates.description,
      icon: updates.icon,
      color: updates.color,
      image: updates.image,
      questions: updates.questions,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Update questions in persona_questions table if provided
  if (updates.questions) {
    // Delete existing questions
    await supabase.from("persona_questions").delete().eq("persona_id", id)

    // Insert new questions
    const questionRecords = updates.questions.map((question, index) => ({
      persona_id: id,
      question_text: question,
      question_number: index + 1,
    }))

    const { error: questionsError } = await supabase.from("persona_questions").insert(questionRecords)

    if (questionsError) {
      console.error("Error updating persona questions:", questionsError)
    }
  }

  return data
}

export async function deletePersonaFromDB(id: string): Promise<void> {
  // Delete questions first (cascade should handle this, but being explicit)
  await supabase.from("persona_questions").delete().eq("persona_id", id)

  const { error } = await supabase.from("personas").delete().eq("id", id)
  if (error) {
    throw error
  }
}
