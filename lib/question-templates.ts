// Make this mutable for dynamic persona management
export const questionTemplates: Record<string, string[]> = {
  developer: [
    "Describe a complex technical problem you've solved recently. What was your approach and what technologies did you use?",
    "How do you stay updated with new programming languages, frameworks, and development best practices?",
    "Walk me through your process for debugging a critical production issue under time pressure.",
    "Describe a time when you had to refactor legacy code. What challenges did you face and how did you overcome them?",
    "How do you approach code reviews? What do you look for and how do you provide constructive feedback?",
    "Explain a situation where you had to learn a new technology quickly for a project. How did you approach it?",
    "Describe your experience with testing (unit, integration, e2e). How do you ensure code quality?",
  ],
  designer: [
    "Describe your design process from initial concept to final implementation. What tools and methods do you use?",
    "How do you approach user research and incorporate user feedback into your design decisions?",
    "Tell me about a time when you had to design for accessibility. What considerations did you make?",
    "Describe a challenging design problem you solved. What constraints did you work within?",
    "How do you collaborate with developers to ensure your designs are implemented correctly?",
    "Explain your approach to creating and maintaining design systems or style guides.",
    "Describe a time when stakeholders disagreed with your design decisions. How did you handle it?",
  ],
  manager: [
    "Describe your approach to setting and tracking team goals. How do you ensure alignment with company objectives?",
    "Tell me about a time when you had to manage an underperforming team member. What was your approach?",
    "How do you handle conflicting priorities and resource constraints across multiple projects?",
    "Describe a situation where you had to lead a team through a significant change or challenge.",
    "How do you foster communication and collaboration within your team and with other departments?",
    "Explain your approach to project planning and risk management. How do you handle unexpected obstacles?",
    "Describe your leadership style and how you adapt it to different team members and situations.",
  ],
  sales: [
    "Describe your approach to qualifying leads and identifying potential customers. What criteria do you use?",
    "Tell me about a challenging sale you closed. What obstacles did you overcome and what was your strategy?",
    "How do you handle objections from prospects? Can you give me a specific example?",
    "Describe your process for building and maintaining long-term client relationships.",
    "How do you stay organized and manage your sales pipeline? What tools and methods do you use?",
    "Tell me about a time when you missed a sales target. What did you learn and how did you improve?",
    "How do you approach upselling or cross-selling to existing clients? What's your strategy?",
  ],
  marketing: [
    "Describe a successful marketing campaign you've developed. What was your strategy and how did you measure success?",
    "How do you approach market research and competitor analysis? What tools and methods do you use?",
    "Tell me about a time when a marketing initiative didn't perform as expected. How did you pivot?",
    "Describe your experience with different marketing channels (digital, social, content, etc.). Which do you find most effective?",
    "How do you measure and analyze marketing ROI? What metrics do you focus on?",
    "Explain your approach to creating buyer personas and targeting specific audience segments.",
    "Describe how you collaborate with sales teams to ensure marketing qualified leads convert effectively.",
  ],
}

// Add PersonaConfig interface to the main types
export interface PersonaConfig {
  id: string
  title: string
  description: string
  icon: string
  color: string
  questions: string[]
}

// Make this mutable for dynamic persona management
export const personaConfigs: PersonaConfig[] = [
  {
    id: "developer",
    title: "Software Developer",
    description: "Technical skills, problem-solving, and coding expertise",
    icon: "Code",
    color: "bg-blue-500",
    questions: questionTemplates.developer,
  },
  {
    id: "designer",
    title: "UI/UX Designer",
    description: "Design thinking, user experience, and creative problem-solving",
    icon: "Palette",
    color: "bg-purple-500",
    questions: questionTemplates.designer,
  },
  {
    id: "manager",
    title: "Project Manager",
    description: "Leadership, planning, and team coordination skills",
    icon: "Users",
    color: "bg-green-500",
    questions: questionTemplates.manager,
  },
  {
    id: "sales",
    title: "Sales Professional",
    description: "Communication, negotiation, and relationship building",
    icon: "TrendingUp",
    color: "bg-orange-500",
    questions: questionTemplates.sales,
  },
  {
    id: "marketing",
    title: "Marketing Specialist",
    description: "Strategy, creativity, and market analysis capabilities",
    icon: "Megaphone",
    color: "bg-pink-500",
    questions: questionTemplates.marketing,
  },
]

// Persona management functions
export function addPersona(config: PersonaConfig) {
  personaConfigs.push(config)
  questionTemplates[config.id] = config.questions
}

export function updatePersona(id: string, config: PersonaConfig) {
  const index = personaConfigs.findIndex((p) => p.id === id)
  if (index !== -1) {
    // If ID changed, update the questionTemplates key
    if (id !== config.id) {
      delete questionTemplates[id]
      questionTemplates[config.id] = config.questions
    } else {
      questionTemplates[config.id] = config.questions
    }
    personaConfigs[index] = config
  }
}

export function deletePersona(id: string) {
  const index = personaConfigs.findIndex((p) => p.id === id)
  if (index !== -1) {
    personaConfigs.splice(index, 1)
    delete questionTemplates[id]
  }
}

export function getPersonaById(id: string): PersonaConfig | undefined {
  return personaConfigs.find((p) => p.id === id)
}
