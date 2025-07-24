import { supabase } from "./supabase"
import {
  User,
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
  Donut,
  Cookie,
  Beef,
  Fish,
  Wheat,
  Salad,
  Code,
  Palette,
  Calculator,
  Briefcase,
  Stethoscope,
  GraduationCap,
  Wrench,
  Truck,
  Building,
  ShoppingCart,
  Camera,
  Music,
  Gamepad2,
  Heart,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Laptop,
  Database,
  Settings,
  BarChart,
  TrendingUp,
  Target,
  Award,
  Star,
  Crown,
  Gem,
  Rocket,
  Lightbulb,
  Brain,
  Eye,
  Ear,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Home,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  TreePine,
  Flower,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Snowflake,
  Flame,
  Droplets,
  Mountain,
  Waves,
  Leaf,
  SproutIcon as Seedling,
} from "lucide-react"

export const iconMap = {
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
  Donut,
  Cookie,
  Beef,
  Fish,
  Wheat,
  Salad,

  // Technology
  Code,
  Smartphone,
  Laptop,
  Database,
  Settings,
  Zap,
  Globe,

  // Business & Finance
  Briefcase,
  Calculator,
  BarChart,
  TrendingUp,
  Target,
  ShoppingCart,
  Building,

  // Creative
  Palette,
  Camera,
  Music,
  Gamepad2,
  Lightbulb,

  // Healthcare & Education
  Stethoscope,
  GraduationCap,
  Heart,
  Brain,
  Eye,
  Ear,

  // Industrial & Transportation
  Wrench,
  Truck,
  Car,
  Plane,
  Ship,
  Train,
  Bike,

  // Communication & Time
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Clock,

  // Achievement & Status
  Award,
  Star,
  Crown,
  Gem,
  Rocket,
  Shield,

  // Location & Environment
  MapPin,
  Home,
  TreePine,
  Flower,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Snowflake,
  Flame,
  Droplets,
  Mountain,
  Waves,
  Leaf,
  Seedling,

  // Default
  User,
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
    const { data, error } = await supabase
      .from("personas")
      .insert([
        {
          ...persona,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating persona:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createPersonaInDB:", error)
    return null
  }
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig | null> {
  try {
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

    return data
  } catch (error) {
    console.error("Error in updatePersonaInDB:", error)
    return null
  }
}

export async function deletePersonaFromDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("personas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting persona:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in deletePersonaFromDB:", error)
    return false
  }
}
