import { supabase } from "./supabase"
import { Code, Palette, Users, TrendingUp, Megaphone, ChefHat, Coffee } from "lucide-react"

export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  questions: string[]
  created_at?: string
  updated_at?: string
}

export const iconMap = {
  Code,
  Palette,
  Users,
  TrendingUp,
  Megaphone,
  ChefHat,
  Coffee,
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")

    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Raw database response:", data)
    console.log(`Fetched ${data?.length || 0} personas`)

    if (!data || data.length === 0) {
      console.log("No personas found in database")
      return []
    }

    // Transform the data and add detailed logging
    const personas = data.map((persona, index) => {
      console.log(`Persona ${index + 1}:`, {
        id: persona.id,
        title: persona.title,
        description: persona.description,
        icon: persona.icon,
        questionsCount: persona.questions?.length || 0,
      })

      return {
        id: persona.id,
        title: persona.title,
        description: persona.description,
        icon: persona.icon,
        questions: persona.questions || [],
      }
    })

    console.log("Detailed persona data:", JSON.stringify(personas, null, 2))
    return personas
  } catch (error) {
    console.error("Error fetching personas:", error)
    return []
  }
}

export async function createPersona(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig> {
  const { data, error } = await supabase.from("personas").insert([persona]).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePersona(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig> {
  const { data, error } = await supabase.from("personas").update(updates).eq("id", id).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function deletePersona(id: string): Promise<void> {
  const { error } = await supabase.from("personas").delete().eq("id", id)

  if (error) {
    throw error
  }
}
