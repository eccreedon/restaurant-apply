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
  questions: string[]
  created_at?: string
  updated_at?: string
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")
    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log(`Fetched ${data?.length || 0} personas`)
    console.log("Detailed persona data:", data)

    if (data) {
      data.forEach((persona, index) => {
        console.log(`Persona ${index + 1}:`, {
          id: persona.id,
          title: persona.title,
          description: persona.description,
          icon: persona.icon,
          questionsCount: persona.questions?.length || 0,
        })
      })
    }

    return data || []
  } catch (error) {
    console.error("Error fetching personas:", error)
    return []
  }
}

export async function createPersonaInDB(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig> {
  const { data, error } = await supabase.from("personas").insert([persona]).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig> {
  const { data, error } = await supabase.from("personas").update(updates).eq("id", id).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function deletePersonaFromDB(id: string): Promise<void> {
  const { error } = await supabase.from("personas").delete().eq("id", id)

  if (error) {
    throw error
  }
}
