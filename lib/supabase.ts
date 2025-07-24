import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface PersonaRow {
  id: string
  title: string
  description: string
  icon: string
  color: string
  questions: string[]
  created_at?: string
  updated_at?: string
}

export interface AssessmentRow {
  id: string
  title: string
  persona_id: string
  created_at: string
  shareable_link: string
}

export interface ResponseRow {
  id: string
  assessment_id: string
  respondent_name: string
  respondent_email: string
  persona_id: string
  answers: any[]
  ai_summary?: string
  completed_at: string
}
