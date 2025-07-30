"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, Eye, Code, FileText, Clock, Users, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { useToast } from "../../components/ui/use-toast"
import MonacoEditor from "@monaco-editor/react"

export default function CreateAssessment() {
  const { toast } = useToast()
  const [assessmentId, setAssessmentId] = useState(null)
  const [assessmentData, setAssessmentData] = useState({
    title: "",
    description: "",
    type: "test",
    difficulty: "intermediate",
    duration: 60,
    passingScore: 70,
    instructions: "",
    tags: [],
    deadline: ""
  })

  const [questions, setQuestions] = useState([])
  const [newTag, setNewTag] = useState("")
  // Add state for coding test cases
  const [codingTestCases, setCodingTestCases] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState("")
  const [starterCodeFullscreen, setStarterCodeFullscreen] = useState(false)
  const [solutionFullscreen, setSolutionFullscreen] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])
  // Helper to get default question state by type
  const getDefaultQuestion = (type = "multiple-choice") => {
    switch (type) {
      case "multiple-choice":
        return {
          type: "multiple-choice",
          question: "",
          options: ["", ""], // Start with 2 options
          correctAnswer: 0,
          points: 10,
          explanation: "",
        }
      case "coding":
        return {
          type: "coding",
          question: "",
          starterCode: "",
          solution: "",
          points: 10,
          explanation: "",
        }
      case "short-answer":
        return {
          type: "short-answer",
          question: "",
          answer: "",
          points: 10,
          explanation: "",
        }
      case "essay":
        return {
          type: "essay",
          question: "",
          points: 10,
          explanation: "",
        }
      default:
        return {
    type: "multiple-choice",
    question: "",
          options: ["", ""],
    correctAnswer: 0,
    points: 10,
    explanation: "",
        }
    }
  }

  const [currentQuestion, setCurrentQuestion] = useState(getDefaultQuestion())

  // Add test case to codingTestCases
  const addTestCase = () => {
    setCodingTestCases(prev => [...prev, { input: '', expectedOutput: '' }])
  }
  const removeTestCase = (idx) => {
    setCodingTestCases(prev => prev.filter((_, i) => i !== idx))
  }
  const updateTestCase = (idx, field, value) => {
    setCodingTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc))
  }

  // When question type changes, reset test cases
  const handleQuestionTypeChange = (type) => {
    setCurrentQuestion(getDefaultQuestion(type))
    setCodingTestCases([])
  }

  // Add/remove option for multiple choice
  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""]
    }))
  }
  const removeOption = (index) => {
    setCurrentQuestion((prev) => {
      const newOptions = prev.options.filter((_, i) => i !== index)
      let newCorrect = prev.correctAnswer
      if (index === prev.correctAnswer) newCorrect = 0
      else if (index < prev.correctAnswer) newCorrect = prev.correctAnswer - 1
      return {
        ...prev,
        options: newOptions,
        correctAnswer: newCorrect
      }
    })
  }

  // Add question, only include relevant fields
  const addQuestion = () => {
    if (!currentQuestion.question.trim()) return
    let questionToAdd = { type: currentQuestion.type, question: currentQuestion.question, points: currentQuestion.points, explanation: currentQuestion.explanation }
    if (currentQuestion.type === "multiple-choice") {
      questionToAdd.options = currentQuestion.options.map(opt => String(opt))
      questionToAdd.correctAnswer = Number(currentQuestion.correctAnswer)
    } else if (currentQuestion.type === "coding") {
      questionToAdd.starter_code = currentQuestion.starterCode || ""
      questionToAdd.solution = currentQuestion.solution || ""
      questionToAdd.test_cases = JSON.stringify(codingTestCases)
    } else if (currentQuestion.type === "short-answer") {
      questionToAdd.answer = currentQuestion.answer || ""
    }
    setQuestions((prev) => [...prev, { ...questionToAdd, id: Date.now() }])
    setCurrentQuestion(getDefaultQuestion(currentQuestion.type))
    setCodingTestCases([])
  }

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const addTag = () => {
    if (newTag.trim() && !assessmentData.tags.includes(newTag.trim())) {
      setAssessmentData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setAssessmentData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Add this function to update assessmentData fields
  const handleAssessmentChange = (field, value) => {
    setAssessmentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (isDraft = false) => {
    // Map all questions to ensure snake_case for API
    const mappedQuestions = questions.map(q => {
      if (q.type === "coding") {
        return {
          ...q,
          starter_code: q.starterCode !== undefined ? q.starterCode : q.starter_code || "",
          solution: q.solution || "",
        }
      } else if (q.type === "short-answer") {
        return {
          ...q,
          answer: q.answer || "",
        }
      } else {
        return q
      }
    })
    // Map camelCase to snake_case for backend
    const assessment = {
      title: assessmentData.title,
      description: assessmentData.description,
      type: "test",
      is_test: true,
      difficulty: assessmentData.difficulty,
      duration: assessmentData.duration,
      passing_score: assessmentData.passingScore, // snake_case
      instructions: assessmentData.instructions,
      tags: Array.isArray(assessmentData.tags) ? assessmentData.tags : [], // always array
      status: isDraft ? "draft" : "active",
      createdAt: assessmentData.createdAt || new Date().toISOString(),
      deadline: assessmentData.deadline || "",
      questions: mappedQuestions,
      category_id: categoryId || null,
    }
    try {
      let res, data
      if (!assessmentId) {
        res = await fetch(`${import.meta.env.VITE_API_URL}/assessments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(assessment),
        })
        data = await res.json()
        if (res.ok && data.assessment_id) setAssessmentId(data.assessment_id)
      } else {
        res = await fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(assessment),
        })
        data = await res.json()
      }
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to save assessment", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: isDraft ? "Draft saved!" : "Assessment published!", variant: "default" })
      if (!isDraft) {
        setAssessmentId(null)
        setAssessmentData({
          title: "",
          description: "",
          type: "test",
          difficulty: "intermediate",
          duration: 60,
          passingScore: 70,
          instructions: "",
          tags: [],
          deadline: ""
        })
        setQuestions([])
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }



  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create Assessment</h1>
                <p className="text-muted-foreground">Design a comprehensive technical assessment</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSave(true)} className="bg-transparent">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => handleSave(false)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>

            {/* Add this just below the main heading (Create Assessment): */}
            <Card className="mb-6 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
              <CardContent className="py-4 flex items-center gap-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">You are creating a <span className="font-bold">Test Assessment</span>.</p>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">Test assessments are public practice assessments. Any interviewee can take them for practice and skill improvement. Use these to help candidates prepare for real interviews.</p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the fundamental details of your assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assessment Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Senior React Developer Assessment"
                      value={assessmentData.title}
                      onChange={(e) => handleAssessmentChange("title", e.target.value)}
                    />
                  </div>
                  {/* Remove the Assessment Type selector from the form UI (do not render the Select for type) */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId === "" ? "uncategorized" : categoryId} onValueChange={v => setCategoryId(v === "uncategorized" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this assessment covers and what skills it evaluates..."
                    value={assessmentData.description}
                    onChange={(e) => handleAssessmentChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={assessmentData.difficulty}
                      onValueChange={(value) => handleAssessmentChange("difficulty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={assessmentData.duration}
                      onChange={(e) => handleAssessmentChange("duration", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={assessmentData.passingScore}
                      onChange={(e) => handleAssessmentChange("passingScore", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={assessmentData.deadline}
                      onChange={(e) => handleAssessmentChange("deadline", e.target.value)}
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions for Candidates</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Provide clear instructions on how to complete this assessment..."
                    value={assessmentData.instructions}
                    onChange={(e) => handleAssessmentChange("instructions", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {assessmentData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (e.g., React, JavaScript, Frontend)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button type="button" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
                <CardDescription>Add questions to evaluate candidate skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question List */}
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Added Questions</h3>
                    {questions.map((q, index) => (
                      <div key={q.id} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{q.type}</Badge>
                              <span className="text-sm text-muted-foreground">{q.points} points</span>
                            </div>
                            <p className="font-medium mb-2">
                              Q{index + 1}: {q.question}
                            </p>
                            {q.type === "multiple-choice" && (
                              <div className="text-sm text-muted-foreground">
                                Correct answer: {q.options[q.correctAnswer]}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(q.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator />
                  </div>
                )}

                {/* Add New Question */}
                <div className="space-y-4">
                  <h3 className="font-medium">Add New Question</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={handleQuestionTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="coding">Coding Challenge</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, points: Number.parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      placeholder="Enter your question here..."
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, question: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  {currentQuestion.type === "multiple-choice" && (
                    <div className="space-y-4">
                      <Label>Answer Options</Label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <RadioGroup
                            value={currentQuestion.correctAnswer.toString()}
                            onValueChange={(value) => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: Number(value) }))}
                          >
                            <RadioGroupItem value={index.toString()} />
                          </RadioGroup>
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => setCurrentQuestion((prev) => {
                              const newOptions = [...prev.options]
                              newOptions[index] = e.target.value
                              return { ...prev, options: newOptions }
                            })}
                          />
                          {currentQuestion.options.length > 2 && (
                            <Button type="button" size="icon" variant="ghost" onClick={() => removeOption(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {index === currentQuestion.correctAnswer && "(Correct)"}
                          </span>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={addOption}>
                        + Add Option
                      </Button>
                    </div>
                  )}
                  {currentQuestion.type === "coding" && (
                    <div className="space-y-2">
                      <Label>Starter Code</Label>
                      <div className="relative">
                        {starterCodeFullscreen && (
                          <div className="fixed inset-0 z-50 bg-background flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                              <h3 className="text-lg font-semibold">Starter Code Editor</h3>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => setStarterCodeFullscreen(false)}
                              >
                                <Minimize2 />
                              </Button>
                            </div>
                            <div className="flex-1 flex flex-col justify-center items-center w-full h-full pt-12 pb-8">
                              <MonacoEditor
                                height="80vh"
                                width="90vw"
                                defaultLanguage="javascript"
                                value={currentQuestion.starterCode || ""}
                                onChange={v => setCurrentQuestion((prev) => ({ ...prev, starterCode: v || "" }))}
                                theme="vs-dark"
                                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                              />
                            </div>
                          </div>
                        )}
                        {!starterCodeFullscreen && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-2 z-20"
                            aria-label="Expand editor"
                            onClick={() => setStarterCodeFullscreen(true)}
                          >
                            <Maximize2 />
                          </Button>
                        )}
                        {!starterCodeFullscreen && (
                          <div className="rounded border bg-muted/50 overflow-hidden" style={{ minHeight: 200 }}>
                            <MonacoEditor
                              height="200px"
                              defaultLanguage="javascript"
                              value={currentQuestion.starterCode || ""}
                              onChange={v => setCurrentQuestion((prev) => ({ ...prev, starterCode: v || "" }))}
                              theme="vs-dark"
                              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                            />
                          </div>
                        )}
                      </div>
                      <Label>Solution</Label>
                      <div className="relative">
                        {solutionFullscreen && (
                          <div className="fixed inset-0 z-50 bg-background flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                              <h3 className="text-lg font-semibold">Solution Editor</h3>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => setSolutionFullscreen(false)}
                              >
                                <Minimize2 />
                              </Button>
                            </div>
                            <div className="flex-1 flex flex-col justify-center items-center w-full h-full pt-12 pb-8">
                              <MonacoEditor
                                height="80vh"
                                width="90vw"
                                defaultLanguage="javascript"
                                value={currentQuestion.solution || ""}
                                onChange={v => setCurrentQuestion((prev) => ({ ...prev, solution: v || "" }))}
                                theme="vs-dark"
                                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                              />
                            </div>
                          </div>
                        )}
                        {!solutionFullscreen && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-2 z-20"
                            aria-label="Expand editor"
                            onClick={() => setSolutionFullscreen(true)}
                          >
                            <Maximize2 />
                          </Button>
                        )}
                        {!solutionFullscreen && (
                          <div className="rounded border bg-muted/50 overflow-hidden" style={{ minHeight: 200 }}>
                            <MonacoEditor
                              height="200px"
                              defaultLanguage="javascript"
                              value={currentQuestion.solution || ""}
                              onChange={v => setCurrentQuestion((prev) => ({ ...prev, solution: v || "" }))}
                              theme="vs-dark"
                              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                            />
                          </div>
                        )}
                      </div>
                      <Label>Test Cases</Label>
                      <div className="space-y-2">
                        {codingTestCases.map((tc, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              placeholder="Input"
                              value={tc.input}
                              onChange={e => updateTestCase(idx, 'input', e.target.value)}
                              className="w-1/2"
                            />
                            <Input
                              placeholder="Expected Output"
                              value={tc.expectedOutput}
                              onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)}
                              className="w-1/2"
                            />
                            <Button type="button" size="icon" variant="ghost" onClick={() => removeTestCase(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addTestCase}>
                          + Add Test Case
                        </Button>
                      </div>
                    </div>
                  )}
                  {currentQuestion.type === "short-answer" && (
                    <div className="space-y-2">
                      <Label>Expected Answer</Label>
                      <Input
                        placeholder="Enter the expected answer..."
                        value={currentQuestion.answer || ""}
                        onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, answer: e.target.value }))}
                      />
                    </div>
                  )}


                  <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      placeholder="Provide an explanation for the correct answer..."
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button onClick={addQuestion} disabled={!currentQuestion.question.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold">{questions.length}</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                      <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold">{assessmentData.duration}</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold">{assessmentData.passingScore}%</p>
                    <p className="text-sm text-muted-foreground">Pass Score</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2">
                      <Code className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold">{questions.reduce((sum, q) => sum + q.points, 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg mx-auto mb-2">
                      <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold">{categories.find(c => String(c.id) === String(categoryId))?.name || "Uncategorized"}</p>
                    <p className="text-sm text-muted-foreground">Category</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
 

