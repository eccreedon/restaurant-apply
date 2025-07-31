import { supabase } from "./supabase"

export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  color: string
  image?: string
  questions: string[]
  created_at?: string
  updated_at?: string
}

export async function getAllPersonasFromDB(): Promise<PersonaConfig[]> {
  try {
    console.log("Fetching personas from database...")

    const { data: personasData, error: personasError } = await supabase
      .from("personas")
      .select("*")
      .order("created_at", { ascending: true })

    if (personasError) {
      console.error("Supabase error fetching personas:", personasError)
      throw personasError
    }

    if (!personasData || personasData.length === 0) {
      console.log("No personas found")
      return []
    }

    const personasWithQuestions: PersonaConfig[] = []

    for (const persona of personasData) {
      // First try to get questions from persona_questions table
      const { data: questionsData, error: questionsError } = await supabase
        .from("persona_questions")
        .select("question_text")
        .eq("persona_id", persona.id)
        .order("question_number", { ascending: true })

      let questions: string[] = []

      if (questionsError) {
        console.error(`Error fetching questions for persona ${persona.id}:`, questionsError)
        // Fallback to questions array in personas table
        questions = Array.isArray(persona.questions) ? persona.questions : []
      } else {
        questions = questionsData?.map((q) => q.question_text) || []

        // If no questions in persona_questions table, fallback to personas.questions
        if (questions.length === 0 && persona.questions) {
          questions = Array.isArray(persona.questions) ? persona.questions : []
        }
      }

      personasWithQuestions.push({
        ...persona,
        questions: questions,
      })

      console.log(`Persona ${persona.title}: loaded ${questions.length} questions`)
    }

    console.log(`Fetched ${personasWithQuestions.length} personas with questions`)
    return personasWithQuestions
  } catch (error) {
    console.error("Error fetching personas:", error)
    return []
  }
}

export async function createPersonaInDB(
  persona: Omit<PersonaConfig, "id" | "created_at" | "updated_at">,
): Promise<PersonaConfig> {
  try {
    console.log("Creating persona in database:", persona)

    // Validate required fields
    if (!persona.title?.trim()) {
      throw new Error("Title is required")
    }
    if (!persona.description?.trim()) {
      throw new Error("Description is required")
    }
    if (!persona.questions || persona.questions.length === 0) {
      throw new Error("At least one question is required")
    }

    // Filter out empty questions
    const validQuestions = persona.questions.filter((q) => q && q.trim())
    if (validQuestions.length === 0) {
      throw new Error("At least one non-empty question is required")
    }

    // Prepare the data for insertion
    const insertData: any = {
      title: persona.title.trim(),
      description: persona.description.trim(),
      icon: persona.icon || "👤",
      color: persona.color || "#6B7280",
      questions: validQuestions, // This should now work as text[]
    }

    // Only add image if it exists and is not empty
    if (persona.image && persona.image.trim()) {
      insertData.image = persona.image.trim()
    }

    console.log("Insert data prepared:", insertData)
    console.log("Questions type:", typeof insertData.questions, Array.isArray(insertData.questions))

    const { data, error } = await supabase.from("personas").insert([insertData]).select().single()

    if (error) {
      console.error("Supabase error creating persona:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(`Failed to create persona: ${error.message}`)
    }

    console.log("Persona created successfully:", data)

    // Also create individual question records in persona_questions table
    if (validQuestions.length > 0) {
      const questionRecords = validQuestions.map((question, index) => ({
        persona_id: data.id,
        question_text: question.trim(),
        question_number: index + 1,
      }))

      console.log("Creating question records:", questionRecords)

      const { error: questionsError } = await supabase.from("persona_questions").insert(questionRecords)

      if (questionsError) {
        console.error("Error creating persona questions:", questionsError)
        // Don't throw here, persona was created successfully
      } else {
        console.log("Persona questions created successfully")
      }
    }

    return data
  } catch (error) {
    console.error("Error in createPersonaInDB:", error)
    throw error
  }
}

export async function updatePersonaInDB(id: string, updates: Partial<PersonaConfig>): Promise<PersonaConfig> {
  try {
    console.log("Updating persona in database:", id, updates)

    // Prepare update data
    const updateData: any = {}

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.icon !== undefined) updateData.icon = updates.icon
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.image !== undefined) updateData.image = updates.image

    // Handle questions array properly
    if (updates.questions !== undefined) {
      const validQuestions = updates.questions.filter((q) => q && q.trim())
      updateData.questions = validQuestions
    }

    updateData.updated_at = new Date().toISOString()

    console.log("Update data prepared:", updateData)

    const { data, error } = await supabase.from("personas").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error updating persona:", error)
      throw new Error(`Failed to update persona: ${error.message}`)
    }

    console.log("Persona updated successfully:", data)

    // Update questions in persona_questions table if provided
    if (updates.questions) {
      // Delete existing questions
      await supabase.from("persona_questions").delete().eq("persona_id", id)

      // Insert new questions (only non-empty ones)
      const validQuestions = updates.questions.filter((q) => q && q.trim())
      if (validQuestions.length > 0) {
        const questionRecords = validQuestions.map((question, index) => ({
          persona_id: id,
          question_text: question.trim(),
          question_number: index + 1,
        }))

        const { error: questionsError } = await supabase.from("persona_questions").insert(questionRecords)

        if (questionsError) {
          console.error("Error updating persona questions:", questionsError)
        } else {
          console.log("Persona questions updated successfully")
        }
      }
    }

    return data
  } catch (error) {
    console.error("Error in updatePersonaInDB:", error)
    throw error
  }
}

export async function deletePersonaFromDB(id: string): Promise<void> {
  try {
    console.log("Deleting persona from database:", id)

    // Delete questions first (cascade should handle this, but being explicit)
    await supabase.from("persona_questions").delete().eq("persona_id", id)

    const { error } = await supabase.from("personas").delete().eq("id", id)
    if (error) {
      console.error("Supabase error deleting persona:", error)
      throw error
    }

    console.log("Persona deleted successfully")
  } catch (error) {
    console.error("Error in deletePersonaFromDB:", error)
    throw error
  }
}
