-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Code',
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  shareable_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  respondent_name TEXT NOT NULL,
  respondent_email TEXT NOT NULL,
  persona_id TEXT NOT NULL REFERENCES personas(id),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default personas if they don't exist
INSERT INTO personas (id, title, description, icon, color, questions) VALUES
('developer', 'Software Developer', 'Technical skills, problem-solving, and coding expertise', 'Code', 'bg-blue-500', 
 '["Describe a complex technical problem you''ve solved recently. What was your approach and what technologies did you use?", "How do you stay updated with new programming languages, frameworks, and development best practices?", "Walk me through your process for debugging a critical production issue under time pressure.", "Describe a time when you had to refactor legacy code. What challenges did you face and how did you overcome them?", "How do you approach code reviews? What do you look for and how do you provide constructive feedback?", "Explain a situation where you had to learn a new technology quickly for a project. How did you approach it?", "Describe your experience with testing (unit, integration, e2e). How do you ensure code quality?"]'::jsonb),

('designer', 'UI/UX Designer', 'Design thinking, user experience, and creative problem-solving', 'Palette', 'bg-purple-500',
 '["Describe your design process from initial concept to final implementation. What tools and methods do you use?", "How do you approach user research and incorporate user feedback into your design decisions?", "Tell me about a time when you had to design for accessibility. What considerations did you make?", "Describe a challenging design problem you solved. What constraints did you work within?", "How do you collaborate with developers to ensure your designs are implemented correctly?", "Explain your approach to creating and maintaining design systems or style guides.", "Describe a time when stakeholders disagreed with your design decisions. How did you handle it?"]'::jsonb),

('manager', 'Project Manager', 'Leadership, planning, and team coordination skills', 'Users', 'bg-green-500',
 '["Describe your approach to setting and tracking team goals. How do you ensure alignment with company objectives?", "Tell me about a time when you had to manage an underperforming team member. What was your approach?", "How do you handle conflicting priorities and resource constraints across multiple projects?", "Describe a situation where you had to lead a team through a significant change or challenge.", "How do you foster communication and collaboration within your team and with other departments?", "Explain your approach to project planning and risk management. How do you handle unexpected obstacles?", "Describe your leadership style and how you adapt it to different team members and situations."]'::jsonb),

('sales', 'Sales Professional', 'Communication, negotiation, and relationship building', 'TrendingUp', 'bg-orange-500',
 '["Describe your approach to qualifying leads and identifying potential customers. What criteria do you use?", "Tell me about a challenging sale you closed. What obstacles did you overcome and what was your strategy?", "How do you handle objections from prospects? Can you give me a specific example?", "Describe your process for building and maintaining long-term client relationships.", "How do you stay organized and manage your sales pipeline? What tools and methods do you use?", "Tell me about a time when you missed a sales target. What did you learn and how did you improve?", "How do you approach upselling or cross-selling to existing clients? What''s your strategy?"]'::jsonb),

('marketing', 'Marketing Specialist', 'Strategy, creativity, and market analysis capabilities', 'Megaphone', 'bg-pink-500',
 '["Describe a successful marketing campaign you''ve developed. What was your strategy and how did you measure success?", "How do you approach market research and competitor analysis? What tools and methods do you use?", "Tell me about a time when a marketing initiative didn''t perform as expected. How did you pivot?", "Describe your experience with different marketing channels (digital, social, content, etc.). Which do you find most effective?", "How do you measure and analyze marketing ROI? What metrics do you focus on?", "Explain your approach to creating buyer personas and targeting specific audience segments.", "Describe how you collaborate with sales teams to ensure marketing qualified leads convert effectively."]'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
