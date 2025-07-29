import { supabase } from "./supabase"
import {
  User,
  Users,
  ChefHat,
  Coffee,
  Utensils,
  Pizza,
  Wine,
  ShoppingCart,
  Clock,
  Star,
  Heart,
  Truck,
  Package,
  Headphones,
  Shield,
  Wrench,
  Briefcase,
  GraduationCap,
  Building,
  Car,
  Home,
  Plane,
  Camera,
  Music,
  Gamepad2,
  Palette,
  Code,
  Stethoscope,
  Scale,
  Hammer,
  Scissors,
  Shirt,
  Flower,
  TreePine,
  Zap,
  Globe,
  BookOpen,
  PenTool,
  Calculator,
  Target,
  TrendingUp,
  BarChart,
  DollarSign,
  CreditCard,
  Smartphone,
  Laptop,
  Wifi,
  Database,
  Server,
  Cloud,
  Lock,
  Key,
  Settings,
  Cog,
  Activity,
  PowerIcon as Pulse,
  Thermometer,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Wind,
  Mountain,
  Waves,
  Flame,
  Leaf,
  Sprout,
  Bug,
  Fish,
  Bird,
  Rabbit,
  Cat,
  Dog,
  Megaphone,
} from "lucide-react"

export const iconMap = {
  User,
  Users,
  ChefHat,
  Coffee,
  Utensils,
  Pizza,
  Wine,
  ShoppingCart,
  Clock,
  Star,
  Heart,
  Truck,
  Package,
  Headphones,
  Shield,
  Wrench,
  Briefcase,
  GraduationCap,
  Building,
  Car,
  Home,
  Plane,
  Camera,
  Music,
  Gamepad2,
  Palette,
  Code,
  Stethoscope,
  Scale,
  Hammer,
  Scissors,
  Shirt,
  Flower,
  TreePine,
  Zap,
  Globe,
  BookOpen,
  PenTool,
  Calculator,
  Target,
  TrendingUp,
  BarChart,
  DollarSign,
  CreditCard,
  Smartphone,
  Laptop,
  Wifi,
  Database,
  Server,
  Cloud,
  Lock,
  Key,
  Settings,
  Cog,
  Activity,
  Pulse,
  Thermometer,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Wind,
  Mountain,
  Waves,
  Flame,
  Leaf,
  Sprout,
  Bug,
  Fish,
  Bird,
  Rabbit,
  Cat,
  Dog,
  Megaphone,
}

export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  questions: string[]
  created_at?: string
  updated_at?: string
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")
    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Database error:", error)
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
