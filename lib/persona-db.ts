import { supabase } from "./supabase"
import {
  User,
  Briefcase,
  Code,
  Palette,
  TrendingUp,
  Users,
  Shield,
  Wrench,
  GraduationCap,
  Heart,
  Building,
  Truck,
  ChefHat,
  UtensilsCrossed,
  Utensils,
  Wine,
  Coffee,
  Pizza,
  Soup,
  CakeSlice,
  IceCream,
  Sandwich,
  Apple,
  Grape,
  Cherry,
  Banana,
  Milk,
  Egg,
  Carrot,
  Croissant,
  Cookie,
  Beef,
  Fish,
  Wheat,
  Salad,
} from "lucide-react"

export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  questions: string[]
}

export const iconMap = {
  // Professional
  User,
  Briefcase,
  Code,
  Palette,
  TrendingUp,
  Users,
  Shield,
  Wrench,
  GraduationCap,
  Heart,
  Building,
  Truck,
  // Food Service & Hospitality
  ChefHat,
  UtensilsCrossed,
  Utensils,
  Wine,
  Coffee,
  Pizza,
  Soup,
  CakeSlice,
  IceCream,
  Sandwich,
  Apple,
  Grape,
  Cherry,
  Banana,
  Milk,
  Egg,
  Carrot,
  Croissant,
  Cookie,
  Beef,
  Fish,
  Wheat,
  Salad,
}

export const iconCategories = {
  Professional: [
    "User",
    "Briefcase",
    "Code",
    "Palette",
    "TrendingUp",
    "Users",
    "Shield",
    "Wrench",
    "GraduationCap",
    "Heart",
    "Building",
    "Truck",
  ],
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
    "Cookie",
    "Beef",
    "Fish",
    "Wheat",
    "Salad",
  ],
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")

    const { data, error } = await supabase.from("personas").select("*").order("title")

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
  persona: Omit<PersonaConfig, "id">,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Creating persona:", persona.title)

    const { data, error } = await supabase
      .from("personas")
      .insert([
        {
          title: persona.title,
          description: persona.description,
          icon: persona.icon,
          questions: persona.questions,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating persona:", error)
      throw error
    }

    console.log("Persona created successfully:", data)
    return { success: true }
  } catch (error) {
    console.error("Error in createPersonaInDB:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updatePersonaInDB(
  id: string,
  updates: Partial<PersonaConfig>,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Updating persona:", id)

    const { data, error } = await supabase.from("personas").update(updates).eq("id", id).select()

    if (error) {
      console.error("Error updating persona:", error)
      throw error
    }

    console.log("Persona updated successfully:", data)
    return { success: true }
  } catch (error) {
    console.error("Error in updatePersonaInDB:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function deletePersonaFromDB(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Deleting persona:", id)

    const { error } = await supabase.from("personas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting persona:", error)
      throw error
    }

    console.log("Persona deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("Error in deletePersonaFromDB:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
