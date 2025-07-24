"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { questionTemplates, personaConfigs, type PersonaConfig } from "@/lib/question-templates"
import type { Persona } from "@/app/page"

export function QuestionEditor() {
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [tempQuestion, setTempQuestion] = useState("")
  const [newPersona, setNewPersona] = useState<Partial<PersonaConfig>>({})

  const handleEditQuestion = (persona: Persona, questionIndex: number) => {
    setEditingPersona(persona)
    setEditingQuestion(questionIndex)
    setTempQuestion(questionTemplates[persona][questionIndex])
  }

  const handleSaveQuestion = () => {
    if (editingPersona && editingQuestion !== null) {
      questionTemplates[editingPersona][editingQuestion] = tempQuestion
      setEditingPersona(null)
      setEditingQuestion(null)
      setTempQuestion("")
    }
  }

  const handleCancelEdit = () => {
    setEditingPersona(null)
    setEditingQuestion(null)
    setTempQuestion("")
  }

  const handleDeleteQuestion = (persona: Persona, questionIndex: number) => {
    questionTemplates[persona].splice(questionIndex, 1)
  }

  const handleAddQuestion = (persona: Persona) => {
    questionTemplates[persona].push("New question - click to edit")
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Question Editor</h1>
        <p className="text-slate-600">Manage personas and customize questionnaire questions</p>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit Questions</TabsTrigger>
          <TabsTrigger value="preview">Preview Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          {personaConfigs.map((persona) => (
            <Card key={persona.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${persona.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{persona.title.charAt(0)}</span>
                    </div>
                    <div>
                      <CardTitle>{persona.title}</CardTitle>
                      <p className="text-sm text-slate-600">{persona.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{questionTemplates[persona.id].length} questions</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionTemplates[persona.id].map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Q{index + 1}
                          </Badge>
                        </div>
                        {editingPersona === persona.id && editingQuestion === index ? (
                          <div className="space-y-3">
                            <Textarea
                              value={tempQuestion}
                              onChange={(e) => setTempQuestion(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveQuestion}>
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-700 leading-relaxed">{question}</p>
                        )}
                      </div>
                      {!(editingPersona === persona.id && editingQuestion === index) && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditQuestion(persona.id, index)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(persona.id, index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="dashed" className="w-full" onClick={() => handleAddQuestion(persona.id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {personaConfigs.map((persona) => (
                  <div key={persona.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 ${persona.color} rounded`}></div>
                      <h3 className="font-semibold">{persona.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{persona.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {questionTemplates[persona.id].length} questions
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
