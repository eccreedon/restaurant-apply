import { supabase } from "./supabase"

export async function debugTables() {
  console.log("=== DEBUGGING DATABASE TABLES ===")

  // Test responses table structure
  try {
    console.log("Testing responses table...")

    // First, try to get table info
    const { data: tableData, error: tableError } = await supabase.from("responses").select("*").limit(1)

    if (tableError) {
      console.error("responses table error:", tableError)
    } else {
      console.log("responses table: EXISTS")
      console.log("Sample data:", tableData?.[0])
    }

    // Try a simple insert test
    console.log("Testing insert...")
    const testData = {
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      phone: "1234567890",
      persona: "Test Persona",
      questions: ["Test question?"],
      answers: ["Test answer"],
    }

    const { data: insertResult, error: insertError } = await supabase.from("responses").insert([testData]).select()

    if (insertError) {
      console.error("Insert test failed:", insertError)
      console.error("Insert error details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      })
    } else {
      console.log("Insert test successful:", insertResult)

      // Clean up test data
      if (insertResult?.[0]?.id) {
        await supabase.from("responses").delete().eq("id", insertResult[0].id)
        console.log("Test data cleaned up")
      }
    }
  } catch (e) {
    console.error("Debug failed:", e)
  }
}
