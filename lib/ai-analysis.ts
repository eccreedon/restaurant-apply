export interface GradingCriteria {
  persona: string
  weightings: {
    technical_knowledge: number
    communication: number
    problem_solving: number
    experience: number
    cultural_fit: number
  }
  scoring_rubric: {
    excellent: { min: 9; description: string }
    good: { min: 7; description: string }
    satisfactory: { min: 5; description: string }
    needs_improvement: { min: 3; description: string }
    poor: { min: 0; description: string }
  }
  specific_requirements: string[]
}

// Define grading criteria for different personas
const GRADING_CRITERIA: Record<string, GradingCriteria> = {
  "Line Cook": {
    persona: "Line Cook",
    weightings: {
      technical_knowledge: 0.3,
      communication: 0.15,
      problem_solving: 0.25,
      experience: 0.2,
      cultural_fit: 0.1,
    },
    scoring_rubric: {
      excellent: { min: 9, description: "Exceptional culinary skills, leadership potential, extensive experience" },
      good: { min: 7, description: "Strong cooking abilities, good teamwork, relevant experience" },
      satisfactory: { min: 5, description: "Basic cooking skills, willing to learn, some experience" },
      needs_improvement: { min: 3, description: "Limited skills, requires significant training" },
      poor: { min: 0, description: "Lacks basic requirements, not suitable for role" },
    },
    specific_requirements: [
      "Food safety knowledge",
      "Ability to work under pressure",
      "Team collaboration skills",
      "Time management",
      "Quality consistency",
    ],
  },
  Server: {
    persona: "Server",
    weightings: {
      technical_knowledge: 0.15,
      communication: 0.35,
      problem_solving: 0.2,
      experience: 0.2,
      cultural_fit: 0.1,
    },
    scoring_rubric: {
      excellent: { min: 9, description: "Outstanding customer service, sales ability, extensive experience" },
      good: { min: 7, description: "Strong people skills, good multitasking, relevant experience" },
      satisfactory: { min: 5, description: "Basic service skills, friendly demeanor, some experience" },
      needs_improvement: { min: 3, description: "Limited customer service experience" },
      poor: { min: 0, description: "Poor communication skills, not customer-focused" },
    },
    specific_requirements: [
      "Customer service excellence",
      "Multitasking ability",
      "Sales skills",
      "Conflict resolution",
      "Menu knowledge capability",
    ],
  },
  // Add more personas as needed
}

// Placeholder AI analysis function - disabled for now
export async function analyzeResponse(data: {
  persona: string
  questions: string[]
  answers: string[]
  respondentName: string
}): Promise<any> {
  // Return null to indicate no analysis should be performed
  return null
}

// Function to analyze answers based on persona criteria
export async function analyzeAnswers(questions: string[], answers: string[], persona: string): Promise<any> {
  // Return null to indicate no analysis should be performed
  // This maintains compatibility with existing code that expects this function
  return null
}

// Function to update grading criteria (for admin use)
export function updateGradingCriteria(persona: string, newCriteria: Partial<GradingCriteria>) {
  if (GRADING_CRITERIA[persona]) {
    GRADING_CRITERIA[persona] = { ...GRADING_CRITERIA[persona], ...newCriteria }
  }
}

// Function to get current grading criteria (for admin interface)
export function getGradingCriteria(persona: string): GradingCriteria | null {
  return GRADING_CRITERIA[persona] || null
}

// Function to list all available personas with criteria
export function getAllGradingCriteria(): Record<string, GradingCriteria> {
  return GRADING_CRITERIA
}
