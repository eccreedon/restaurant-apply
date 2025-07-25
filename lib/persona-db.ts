import { supabase } from "./supabase"
import {
  User,
  Briefcase,
  Code,
  Palette,
  BarChart3,
  Users,
  Shield,
  Wrench,
  HeadphonesIcon,
  TruckIcon,
  Calculator,
  GraduationCap,
  Heart,
  Scale,
  Camera,
  Megaphone,
  Globe,
  Building,
  Coffee,
  UtensilsCrossed,
  ChefHat,
  Pizza,
  Wine,
  IceCream,
  Cake,
  Apple,
  Fish,
  Beef,
  Salad,
  Cookie,
} from "lucide-react"

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

export const iconMap = {
  User,
  Briefcase,
  Code,
  Palette,
  BarChart3,
  Users,
  Shield,
  Wrench,
  HeadphonesIcon,
  TruckIcon,
  Calculator,
  GraduationCap,
  Heart,
  Scale,
  Camera,
  Megaphone,
  Globe,
  Building,
  Coffee,
  UtensilsCrossed,
  ChefHat,
  Pizza,
  Wine,
  IceCream,
  Cake,
  Apple,
  Fish,
  Beef,
  Salad,
  Cookie,
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching all personas from database...")

    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching personas:", error)
      throw error
    }

    console.log(`Fetched ${data?.length || 0} personas`)
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

    const { data, error } = await supabase
      .from("personas")
      .insert([
        {
          title: persona.title,
          description: persona.description,
          icon: persona.icon,
          color: persona.color,
          questions: persona.questions,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating persona:", error)
      throw error
    }

    console.log("Persona created successfully:", data)
    return data
  } catch (error) {
    console.error("Error in createPersonaInDB:", error)
    throw error
  }
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig | null> {
  try {
    console.log("Updating persona in database:", id, updates)

    const { data, error } = await supabase
      .from("personas")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating persona:", error)
      throw error
    }

    console.log("Persona updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error in updatePersonaInDB:", error)
    throw error
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

export async function getPersonaFromDB(id: string): Promise<PersonaConfig | null> {
  try {
    console.log("Fetching persona from database:", id)

    const { data, error } = await supabase.from("personas").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching persona:", error)
      throw error
    }

    console.log("Persona fetched successfully:", data)
    return data
  } catch (error) {
    console.error("Error in getPersonaFromDB:", error)
    return null
  }
}
