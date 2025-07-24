import { supabase } from "./supabase"
import {
  User,
  ChefHat,
  Utensils,
  UtensilsCrossed,
  Wine,
  Coffee,
  Pizza,
  Soup,
  CakeSlice,
  IceCream,
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
  UserCheck,
  Settings,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Wrench,
  Palette,
  Music,
  Camera,
  Gamepad2,
  Car,
  Plane,
  Home,
  Building,
  TreePine,
  Flower,
  Sun,
  Moon,
  Star,
  Zap,
  Target,
  Trophy,
  Gift,
  Bell,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Laptop,
  Headphones,
  Book,
  PenTool,
  Scissors,
  Hammer,
  Paintbrush,
  Microscope,
  Stethoscope,
  Scale,
  Calculator,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  FileText,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  Wifi,
  Lock,
  Key,
  Eye,
  Filter,
  ListOrderedIcon as Sort,
  Download,
  Upload,
  Share,
  Link,
  Mail,
  Phone,
  MessageCircle,
  Video,
  Mic,
  Volume2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Radio,
  Tv,
  Monitor,
  Printer,
  ScanIcon as Scanner,
  Keyboard,
  Mouse,
  CalendarIcon as Date,
} from "lucide-react"

export const iconMap = {
  User,
  ChefHat,
  Utensils,
  UtensilsCrossed,
  Wine,
  Coffee,
  Pizza,
  Soup,
  CakeSlice,
  IceCream,
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
  UserCheck,
  Settings,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Wrench,
  Palette,
  Music,
  Camera,
  Gamepad2,
  Car,
  Plane,
  Home,
  Building,
  TreePine,
  Flower,
  Sun,
  Moon,
  Star,
  Zap,
  Target,
  Trophy,
  Gift,
  Bell,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Laptop,
  Headphones,
  Book,
  PenTool,
  Scissors,
  Hammer,
  Paintbrush,
  Microscope,
  Stethoscope,
  Scale,
  Calculator,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  FileText,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  Wifi,
  Lock,
  Key,
  Eye,
  Filter,
  Sort,
  Download,
  Upload,
  Share,
  Link,
  Mail,
  Phone,
  MessageCircle,
  Video,
  Mic,
  Volume2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Radio,
  Tv,
  Monitor,
  Printer,
  Scanner,
  Keyboard,
  Mouse,
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
