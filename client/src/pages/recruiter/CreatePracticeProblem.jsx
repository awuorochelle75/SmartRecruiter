import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Plus, Trash2, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { Switch } from "../../components/ui/switch"
import MonacoEditor from "@monaco-editor/react"



export default function CreatePracticeProblem() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState("")
  const [problemType, setProblemType] = useState("multiple-choice")
  const [difficulty, setDifficulty] = useState("Easy")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  

  const [options, setOptions] = useState(["", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  

  const [starterCode, setStarterCode] = useState("")
  const [solution, setSolution] = useState("")
  const [testCases, setTestCases] = useState([])
  

  const [answer, setAnswer] = useState("")
  const [explanation, setExplanation] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [points, setPoints] = useState(0)
  const [isPublic, setIsPublic] = useState(true)
  

  const [allowedLanguages, setAllowedLanguages] = useState([])
  const [newLanguage, setNewLanguage] = useState("")
  const [timeLimit, setTimeLimit] = useState(60)
  const [memoryLimit, setMemoryLimit] = useState(128)
  const [visibleTestCases, setVisibleTestCases] = useState([])
  const [hiddenTestCases, setHiddenTestCases] = useState([])
  

  const [answerTemplate, setAnswerTemplate] = useState("")
  const [keywords, setKeywords] = useState([])
  const [newKeyword, setNewKeyword] = useState("")
  const [maxCharLimit, setMaxCharLimit] = useState(200)
  

  const [hints, setHints] = useState([])
  const [newHint, setNewHint] = useState("")
  const [learningResources, setLearningResources] = useState([])
  const [newResource, setNewResource] = useState("")
  const [studySections, setStudySections] = useState([])
  const [newSection, setNewSection] = useState({ title: "", content: "" })
  const [maxAttempts, setMaxAttempts] = useState(1)
  const titleRef = useRef(null)
  const [editorFullscreen, setEditorFullscreen] = useState(false)



  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategories(data))
    if (titleRef.current) titleRef.current.focus()
  }, [])




  const handleAddOption = () => setOptions(prev => [...prev, ""])
  const handleRemoveOption = (idx) => setOptions(prev => prev.length > 2 ? prev.filter((_, i) => i !== idx) : prev)
  const handleOptionChange = (idx, value) => setOptions(prev => prev.map((opt, i) => i === idx ? value : opt))

  const handleAddTestCase = () => setTestCases(prev => [...prev, { input: "", expectedOutput: "" }])
  const handleRemoveTestCase = (idx) => setTestCases(prev => prev.filter((_, i) => i !== idx))
  const handleTestCaseChange = (idx, field, value) => setTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc))

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag("")
    }
  }
  const handleRemoveTag = (tagToRemove) => setTags(prev => prev.filter(tag => tag !== tagToRemove))

  

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !allowedLanguages.includes(newLanguage.trim())) {
      setAllowedLanguages(prev => [...prev, newLanguage.trim()])
      setNewLanguage("")
    }
  }
  const handleRemoveLanguage = lang => setAllowedLanguages(prev => prev.filter(l => l !== lang))

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords(prev => [...prev, newKeyword.trim()])
      setNewKeyword("")
    }
  }
  const handleRemoveKeyword = k => setKeywords(prev => prev.filter(x => x !== k))

  const handleAddHint = () => {
    if (newHint.trim()) {
      setHints(prev => [...prev, newHint.trim()])
      setNewHint("")
    }
  }
  const handleRemoveHint = idx => setHints(prev => prev.filter((_, i) => i !== idx))

  const handleAddResource = () => {
    if (newResource.trim()) {
      setLearningResources(prev => [...prev, newResource.trim()])
      setNewResource("")
    }
  }
  const handleRemoveResource = idx => setLearningResources(prev => prev.filter((_, i) => i !== idx))

  const handleAddSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      setStudySections(prev => [...prev, { ...newSection }])
      setNewSection({ title: "", content: "" })
    }
  }
  const handleRemoveSection = idx => setStudySections(prev => prev.filter((_, i) => i !== idx))

  

  const handleAddVisibleTestCase = () => setVisibleTestCases(prev => [...prev, { input: "", expectedOutput: "" }])
  const handleRemoveVisibleTestCase = idx => setVisibleTestCases(prev => prev.filter((_, i) => i !== idx))
  const handleVisibleTestCaseChange = (idx, field, value) => setVisibleTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc))
  const handleAddHiddenTestCase = () => setHiddenTestCases(prev => [...prev, { input: "", expectedOutput: "" }])
  const handleRemoveHiddenTestCase = idx => setHiddenTestCases(prev => prev.filter((_, i) => i !== idx))
  const handleHiddenTestCaseChange = (idx, field, value) => setHiddenTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc))



  const handleSubmit = async (e) => {
    e.preventDefault()
    let payload = {
      title,
      description,
      difficulty,
      estimated_time: estimatedTime,
      points,
      is_public: isPublic,
      category_id: categoryId || null,
      tags,
      problem_type: problemType,
      max_attempts: maxAttempts,
    }
    if (problemType === "multiple-choice") {
      payload.options = options
      payload.correct_answer = correctAnswer
      payload.explanation = explanation
    } else if (problemType === "coding") {
      payload.allowed_languages = allowedLanguages
      payload.time_limit = timeLimit
      payload.memory_limit = memoryLimit
      payload.starter_code = starterCode
      payload.solution = solution
      payload.visible_test_cases = visibleTestCases
      payload.hidden_test_cases = hiddenTestCases
    } else if (problemType === "short-answer") {
      payload.answer_template = answerTemplate
      payload.keywords = keywords
      payload.max_char_limit = maxCharLimit
    }
    payload.hints = hints
    payload.learning_resources = learningResources
    payload.study_sections = studySections
    const res = await fetch(`${import.meta.env.VITE_API_URL}/practice-problems`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      toast({ title: "Created", description: `Practice problem '${title}' created.` })
      navigate("/recruiter/practice-problems")
    } else {
      toast({ title: "Error", description: "Failed to create problem", variant: "destructive" })
    }
  }




  const isSubmitDisabled = !title.trim() || !description.trim() || !categoryId || !difficulty || (problemType === "multiple-choice" && (options.some(opt => !opt.trim()) || options.length < 2))

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold mb-2">Create Practice Problem</h1>


            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
                <p className="text-muted-foreground text-sm">Set up the core details for your problem.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Two Sum" autoFocus />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId === "" ? "uncategorized" : categoryId} onValueChange={v => setCategoryId(v === "uncategorized" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated Time</Label>
                    <Input id="estimatedTime" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g. 30 min" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input id="points" type="number" value={points} onChange={e => setPoints(Number(e.target.value))} placeholder="e.g. 100" />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <Label htmlFor="isPublic">Public</Label>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    <span className="text-xs text-muted-foreground">If off, only you can see this problem.</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Attempts</Label>
                    <Input id="maxAttempts" type="number" min={1} value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} placeholder="e.g. 3" />
                    <span className="text-xs text-muted-foreground">How many times can a candidate attempt this problem?</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the problem, requirements, and any context..." />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add tag (e.g. array, dp, string)" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={e => e.key === "Enter" && handleAddTag()} />
                    <Button type="button" onClick={handleAddTag}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            

            <Card>
              <CardHeader>
                <CardTitle>Problem Type & Details</CardTitle>
                <p className="text-muted-foreground text-sm">Choose the problem type and fill in the relevant details.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={problemType} onValueChange={setProblemType}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="coding">Coding Challenge</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
                {problemType === "multiple-choice" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <span className="text-xs text-muted-foreground">Add at least 2 options. Mark the correct answer.</span>
                    {options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input type="radio" checked={correctAnswer === idx} onChange={() => setCorrectAnswer(idx)} />
                        <Input value={option} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} />
                        {options.length > 2 && (
                          <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveOption(idx)}><Trash2 className="h-4 w-4" /></Button>
                        )}
                        <span className="text-sm text-muted-foreground">{idx === correctAnswer && "(Correct)"}</span>
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" onClick={handleAddOption}>+ Add Option</Button>
                    <div className="space-y-2 mt-2">
                      <Label>Explanation for Correct Answer</Label>
                      <Textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} placeholder="Explain why this answer is correct..." />
                    </div>
                  </div>
                )}
                {problemType === "coding" && (
                  <div className="space-y-2">
                    <Label>Allowed Languages</Label>
                    <span className="text-xs text-muted-foreground">Add languages candidates can use (e.g. Python, JavaScript).</span>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {allowedLanguages.map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveLanguage(lang)}>{lang} ×</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input placeholder="Add language (e.g. Python)" value={newLanguage} onChange={e => setNewLanguage(e.target.value)} onKeyPress={e => e.key === "Enter" && handleAddLanguage()} />
                      <Button type="button" onClick={handleAddLanguage}>Add</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time Limit (sec)</Label>
                        <Input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} placeholder="e.g. 60" />
                        <span className="text-xs text-muted-foreground">Max time allowed for code execution.</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Memory Limit (MB)</Label>
                        <Input type="number" value={memoryLimit} onChange={e => setMemoryLimit(Number(e.target.value))} placeholder="e.g. 128" />
                        <span className="text-xs text-muted-foreground">Max memory allowed for code execution.</span>
                      </div>
                    </div>
                    <Label>Starter Code</Label>
                    <div className="relative">
                      {editorFullscreen && (
                        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center">
                          <div className="relative w-full h-full flex flex-col">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute right-4 top-4 z-50 bg-background/80 border border-border"
                              aria-label="Collapse editor"
                              onClick={() => setEditorFullscreen(false)}
                            >
                              <Minimize2 />
                            </Button>
                            <div className="flex-1 flex flex-col justify-center items-center w-full h-full pt-12 pb-8">
                              <MonacoEditor
                                height="80vh"
                                width="90vw"
                                defaultLanguage={allowedLanguages[0]?.toLowerCase() || "javascript"}
                                value={starterCode}
                                onChange={v => setStarterCode(v || "")}
                                theme="vs-dark"
                                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {!editorFullscreen && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute right-2 top-2 z-20"
                          aria-label="Expand editor"
                          onClick={() => setEditorFullscreen(true)}
                        >
                          <Maximize2 />
                        </Button>
                      )}
                      {!editorFullscreen && (
                        <div className="rounded border bg-muted/50 overflow-hidden" style={{ minHeight: 200 }}>
                          <MonacoEditor
                            height="200px"
                            defaultLanguage={allowedLanguages[0]?.toLowerCase() || "javascript"}
                            value={starterCode}
                            onChange={v => setStarterCode(v || "")}
                            theme="vs-dark"
                            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                          />
                        </div>
                      )}
                    </div>
                    <Label>Solution</Label>
                    <Textarea value={solution} onChange={e => setSolution(e.target.value)} rows={3} placeholder="Provide the expected solution..." />
                    <Label>Visible Test Cases</Label>
                    <span className="text-xs text-muted-foreground">Candidates see these test cases.</span>
                    <div className="space-y-2">
                      {visibleTestCases.map((tc, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input placeholder="Input" value={tc.input} onChange={e => handleVisibleTestCaseChange(idx, 'input', e.target.value)} className="w-1/2" />
                          <Input placeholder="Expected Output" value={tc.expectedOutput} onChange={e => handleVisibleTestCaseChange(idx, 'expectedOutput', e.target.value)} className="w-1/2" />
                          <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveVisibleTestCase(idx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={handleAddVisibleTestCase}>+ Add Visible Test Case</Button>
                    </div>
                    <Label>Hidden Test Cases</Label>
                    <span className="text-xs text-muted-foreground">Used for evaluation only. Candidates do not see these.</span>
                    <div className="space-y-2">
                      {hiddenTestCases.map((tc, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input placeholder="Input" value={tc.input} onChange={e => handleHiddenTestCaseChange(idx, 'input', e.target.value)} className="w-1/2" />
                          <Input placeholder="Expected Output" value={tc.expectedOutput} onChange={e => handleHiddenTestCaseChange(idx, 'expectedOutput', e.target.value)} className="w-1/2" />
                          <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveHiddenTestCase(idx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="outline" onClick={handleAddHiddenTestCase}>+ Add Hidden Test Case</Button>
                    </div>
                  </div>
                )}
                {problemType === "short-answer" && (
                  <div className="space-y-2">
                    <Label>Answer Template</Label>
                    <Textarea value={answerTemplate} onChange={e => setAnswerTemplate(e.target.value)} rows={2} placeholder="Provide a template or example answer..." />
                    <Label>Keywords for Auto-Evaluation</Label>
                    <span className="text-xs text-muted-foreground">Add keywords that must appear in the answer.</span>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map((k, idx) => (
                        <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(k)}>{k} ×</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input placeholder="Add keyword" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyPress={e => e.key === "Enter" && handleAddKeyword()} />
                      <Button type="button" onClick={handleAddKeyword}>Add</Button>
                    </div>
                    <Label>Max Character Limit</Label>
                    <Input type="number" value={maxCharLimit} onChange={e => setMaxCharLimit(Number(e.target.value))} placeholder="e.g. 200" />
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Hints, Resources, Study Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Hints, Resources & Study Sections</CardTitle>
                <p className="text-muted-foreground text-sm">Add hints, helpful links, or study material to support candidates.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hints (Progressive)</Label>
                  <span className="text-xs text-muted-foreground">Hints are revealed to candidates as they work on the problem.</span>
                  {hints.map((hint, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <Input value={hint} readOnly className="flex-1" />
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveHint(idx)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input placeholder="Add hint" value={newHint} onChange={e => setNewHint(e.target.value)} onKeyPress={e => e.key === "Enter" && handleAddHint()} />
                    <Button type="button" onClick={handleAddHint}>Add</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Learning Resources (Links)</Label>
                  <span className="text-xs text-muted-foreground">Add links to documentation, tutorials, or videos.</span>
                  {learningResources.map((res, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <Input value={res} readOnly className="flex-1" />
                      <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveResource(idx)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input placeholder="Add resource link" value={newResource} onChange={e => setNewResource(e.target.value)} onKeyPress={e => e.key === "Enter" && handleAddResource()} />
                    <Button type="button" onClick={handleAddResource}>Add</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Study Sections</Label>
                  <span className="text-xs text-muted-foreground">Add study material or explanations between problem sections.</span>
                  {studySections.map((section, idx) => (
                    <div key={idx} className="mb-2 border rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{section.title}</span>
                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveSection(idx)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">{section.content}</div>
                    </div>
                  ))}
                  <div className="flex gap-2 mb-2">
                    <Input placeholder="Section Title" value={newSection.title} onChange={e => setNewSection(s => ({ ...s, title: e.target.value }))} />
                    <Input placeholder="Section Content" value={newSection.content} onChange={e => setNewSection(s => ({ ...s, content: e.target.value }))} />
                    <Button type="button" onClick={handleAddSection}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/recruiter/practice-problems")}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitDisabled}>Create Problem</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 


