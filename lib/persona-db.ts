import { supabase, type PersonaRow } from "./supabase"
import type { PersonaConfig } from "@/app/page"

// Convert database row to PersonaConfig
function dbRowToPersonaConfig(row: PersonaRow): PersonaConfig {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    color: row.color,
    questions: Array.isArray(row.questions) ? row.questions : [],
  }
}

// Convert PersonaConfig to database row
function personaConfigToDbRow(persona: PersonaConfig): Omit<PersonaRow, "created_at" | "updated_at"> {
  return {
    id: persona.id,
    title: persona.title,
    description: persona.description,
    icon: persona.icon,
    color: persona.color,
    questions: persona.questions,
  }
}

export async function loadPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Error loading personas:", error)
      return []
    }

    return data.map(dbRowToPersonaConfig)
  } catch (error) {
    console.error("Error loading personas:", error)
    return []
  }
}

export async function savePersonaToDB(persona: PersonaConfig): Promise<boolean> {
  try {
    const { error } = await supabase.from("personas").upsert(personaConfigToDbRow(persona))

    if (error) {
      console.error("Error saving persona:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error saving persona:", error)
    return false
  }
}

export async function deletePersonaFromDB(personaId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("personas").delete().eq("id", personaId)

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

export async function getPersonaFromDB(personaId: string): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase.from("personas").select("*").eq("id", personaId).single()

    if (error) {
      console.error("Error getting persona:", error)
      return null
    }

    return dbRowToPersonaConfig(data)
  } catch (error) {
    console.error("Error getting persona:", error)
    return null
  }
}
