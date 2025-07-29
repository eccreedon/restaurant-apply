import { supabase } from "./supabase"
import {
  User,
  Users,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  Code,
  Palette,
  Settings,
  Phone,
  Mail,
  Calendar,
  FileText,
  Target,
  BarChart,
  PieChart,
  Activity,
  Zap,
  Star,
  Award,
  Trophy,
  Heart,
  Coffee,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  LightbulbIcon as Light,
  Rocket,
  Shield,
  Globe,
  Camera,
  Music,
  Video,
  Image,
  Book,
  Bookmark,
  Tag,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Map,
  Home,
  Building,
  Store,
  Factory,
  Truck,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  FootprintsIcon as Walk,
  PlayIcon as Run,
  Smile,
  Frown,
  Meh,
  Angry,
  AngryIcon as Surprised,
  CloudyIcon as Confused,
  BedIcon as Sleepy,
  ComputerIcon as Cool,
  SmileIcon as Wink,
  SmileIcon as Kiss,
  Laugh,
  CrossIcon as Cry,
  WrenchIcon as Worried,
  AngryIcon as Excited,
  AnnoyedIcon as Bored,
  HospitalIcon as Sick,
  DropletIcon as Dizzy,
  CandyIcon as Crazy,
  HeartIcon as InLove,
  DiamondPlusIcon as Rich,
  PocketIcon as Poor,
  SmartphoneIcon as Smart,
  DumbbellIcon as Dumb,
  PowerIcon as Strong,
  SignalLowIcon as Weak,
  FastForwardIcon as Fast,
  FastForwardIcon as Slow,
  HeaterIcon as Hot,
  CloudyIcon as Cold,
  WindIcon as Wet,
  DropletsIcon as Dry,
  DeleteIcon as Clean,
  CloudyIcon as Dirty,
  ViewIcon as New,
  HistoryIcon as Old,
  ALargeSmallIcon as Big,
  ALargeSmallIcon as Small,
  Tally3Icon as Tall,
  PocketIcon as Short,
  ArrowUpWideNarrowIcon as Wide,
  ArrowDownNarrowWideIcon as Narrow,
  BoldIcon as Thick,
  PocketIcon as Thin,
  HammerIcon as Heavy,
  SunDimIcon as Dark,
  LightbulbIcon as Bright,
  MegaphoneIcon as Loud,
  VibrateOffIcon as Quiet,
  PocketIcon as Soft,
  HardDriveIcon as Hard,
  SmileIcon as Smooth,
  DiffIcon as Rough,
  ShellIcon as Sharp,
  DumbbellIcon as Dull,
  CandyIcon as Sweet,
  CitrusIcon as Sour,
  AngryIcon as Bitter,
  SirenIcon as Salty,
  SpadeIcon as Spicy,
  MinimizeIcon as Mild,
  RefreshCwIcon as Fresh,
  StickerIcon as Stale,
  GrapeIcon as Ripe,
  HashIcon as Raw,
  CookingPotIcon as Cooked,
  SnowflakeIcon as Frozen,
  SnowflakeIcon as Melted,
  SquareIcon as Solid,
  GlassWaterIcon as Liquid,
  FuelIcon as Gas,
  SatelliteIcon as Plasma,
} from "lucide-react"

export const iconMap = {
  User,
  Users,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  Code,
  Palette,
  Settings,
  Phone,
  Mail,
  Calendar,
  FileText,
  Target,
  BarChart,
  PieChart,
  Activity,
  Zap,
  Star,
  Award,
  Trophy,
  Heart,
  Coffee,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Light,
  Rocket,
  Shield,
  Globe,
  Camera,
  Music,
  Video,
  Image,
  Book,
  Bookmark,
  Tag,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Map,
  Home,
  Building,
  Store,
  Factory,
  Truck,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  Walk,
  Run,
  Smile,
  Frown,
  Meh,
  Angry,
  Surprised,
  Confused,
  Sleepy,
  Cool,
  Wink,
  Kiss,
  Laugh,
  Cry,
  Worried,
  Excited,
  Bored,
  Sick,
  Dizzy,
  Crazy,
  InLove,
  Rich,
  Poor,
  Smart,
  Dumb,
  Strong,
  Weak,
  Fast,
  Slow,
  Hot,
  Cold,
  Wet,
  Dry,
  Clean,
  Dirty,
  New,
  Old,
  Big,
  Small,
  Tall,
  Short,
  Wide,
  Narrow,
  Thick,
  Thin,
  Heavy,
  Dark,
  Bright,
  Loud,
  Quiet,
  Soft,
  Hard,
  Smooth,
  Rough,
  Sharp,
  Dull,
  Sweet,
  Sour,
  Bitter,
  Salty,
  Spicy,
  Mild,
  Fresh,
  Stale,
  Ripe,
  Raw,
  Cooked,
  Frozen,
  Melted,
  Solid,
  Liquid,
  Gas,
  Plasma,
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
    console.log("Loading personas from database...")

    const { data, error } = await supabase.from("personas").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching personas:", error)
      return []
    }

    console.log(`Fetched ${data?.length || 0} personas`)
    console.log("Detailed persona data:", JSON.stringify(data, null, 2))

    if (data) {
      data.forEach((persona, index) => {
        console.log(`Persona ${index + 1}:`, {
          id: persona.id,
          title: persona.title,
          description: persona.description,
          icon: persona.icon,
          questionsCount: persona.questions?.length || 0,
          questions: persona.questions,
        })
      })
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllPersonasFromDB:", error)
    return []
  }
}

export async function getPersonaByIdFromDB(id: string): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase.from("personas").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching persona:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getPersonaByIdFromDB:", error)
    return null
  }
}

export async function createPersonaInDB(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase.from("personas").insert([persona]).select().single()

    if (error) {
      console.error("Error creating persona:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createPersonaInDB:", error)
    return null
  }
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig | null> {
  try {
    const { data, error } = await supabase.from("personas").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating persona:", error)
      return null
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
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deletePersonaFromDB:", error)
    return false
  }
}
