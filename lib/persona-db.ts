import { supabase } from "./supabase"
import {
  User,
  Users,
  Briefcase,
  Code,
  Palette,
  BarChart3,
  MessageSquare,
  Settings,
  Target,
  TrendingUp,
  ChefHat,
  Coffee,
} from "lucide-react"

export interface PersonaConfig {
  id?: string
  title: string
  description: string
  icon: string
  questions: string[]
  created_at?: string
  updated_at?: string
}

export const iconMap = {
  User,
  Users,
  Briefcase,
  Code,
  Palette,
  BarChart3,
  MessageSquare,
  Settings,
  Target,
  TrendingUp,
  ChefHat,
  Coffee,
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")

    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching personas:", error)
      throw error
    }

    console.log(`Fetched ${data?.length || 0} personas`)
    console.log("Detailed persona data:", data)

    return data || []
  } catch (error) {
    console.error("Error in getAllPersonasFromDB:", error)
    return []
  }
}

export async function createPersonaInDB(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig | null> {
  try {
    console.log("Creating persona in database:", persona)

    const { data, error } = await supabase.from("personas").insert([persona]).select().single()

    if (error) {
      console.error("Error creating persona:", error)
      throw error
    }

    console.log("Persona created successfully:", data)
    return data
  } catch (error) {
    console.error("Error in createPersonaInDB:", error)
    return null
  }
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig | null> {
  try {
    console.log("Updating persona in database:", id, updates)

    const { data, error } = await supabase.from("personas").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating persona:", error)
      throw error
    }

    console.log("Persona updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error in updatePersonaInDB:", error)
    return null
  }
}

export async function deletePersonaFromDB(id: string): Promise<boolean> {
  try {
    console.log("Deleting persona from database:", id)

    const { error } = await supabase.from("personas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting persona:", error)
      throw error
    }

    console.log("Persona deleted successfully")
    return true
  } catch (error) {
    console.error("Error in deletePersonaFromDB:", error)
    return false
  }
}
