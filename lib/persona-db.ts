import { supabase } from "./supabase"

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
    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading personas:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error loading personas:", error)
    return []
  }
}

export async function createPersonaInDB(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase
      .from("personas")
      .insert({
        title: persona.title,
        description: persona.description,
        icon: persona.icon,
        color: persona.color,
        questions: persona.questions,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating persona:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creating persona:", error)
    return null
  }
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase
      .from("personas")
      .update({
        title: updates.title,
        description: updates.description,
        icon: updates.icon,
        color: updates.color,
        questions: updates.questions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating persona:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating persona:", error)
    return null
  }
}

export async function deletePersonaFromDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("personas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting persona:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting persona:", error)
    return false
  }
}

export async function getPersonaFromDB(id: string): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase.from("personas").select("*").eq("id", id).single()

    if (error) {
      console.error("Error getting persona:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting persona:", error)
    return null
  }
}

// Legacy functions for backward compatibility
export const loadPersonasFromDB = getAllPersonasFromDB
