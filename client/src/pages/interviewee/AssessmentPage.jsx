"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Progress } from "../../components/ui/progress"
import DashboardNavbar from "../../components/DashboardNavbar"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import Footer from "../../components/Footer"
import { Terminal, CheckCircle, XCircle, Loader2, Clock } from "lucide-react"
import MonacoEditor from "@monaco-editor/react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "../../components/ui/dialog"
import { useToast } from "../../components/ui/use-toast"




export default function AssessmentPage() {
  const { id } = useParams() // Assessment ID
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const attemptId = query.get("attempt")

  const [assessment, setAssessment] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [codeOutput, setCodeOutput] = useState("")
  const [codeRunning, setCodeRunning] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [testCaseResults, setTestCaseResults] = useState([])
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [codeOnlyOutput, setCodeOnlyOutput] = useState("")
  const [userInput, setUserInput] = useState("")
  const [inputError, setInputError] = useState("")
  const [timeoutError, setTimeoutError] = useState("")
  const { toast } = useToast()
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)
  const [invitationToken, setInvitationToken] = useState(null)
  const [invitationId, setInvitationId] = useState(null)
  const [showInvitationDialog, setShowInvitationDialog] = useState(false)

  // Timer logic: calculate time left from started_at and duration
  useEffect(() => {
    if (!attempt || !assessment) return
    const duration = assessment.duration || 30 // in minutes
    const startedAt = attempt.started_at ? new Date(attempt.started_at) : null
    if (!startedAt) return
    const endTime = new Date(startedAt.getTime() + duration * 60000)
    function updateTimer() {
      const now = new Date()
      const diff = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeLeft(diff)
      if (diff <= 0) {
        clearInterval(timerRef.current)
        // Auto-submit if not already submitted
        if (attempt.status === 'in_progress') confirmSubmitAssessment()
      }
    }
    updateTimer()
    timerRef.current = setInterval(updateTimer, 1000)
    return () => clearInterval(timerRef.current)
  }, [attempt, assessment])

  // Format time left as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Fetch assessment data
  useEffect(() => {
    async function fetchAssessmentData() {
      setLoading(true)
      try {
        const invitationToken = query.get("invitation")
        
        if (invitationToken) {
          // Handle invitation link
          const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/assessment/${id}?invitation=${invitationToken}`, { 
            credentials: "include" 
          })
          if (res.ok) {
            const data = await res.json()
            setAssessment(data)
            setInvitationToken(invitationToken)
            setInvitationId(data.invitation_id)
            setShowInvitationDialog(true)
            // Don't set attempt yet - user needs to accept invitation first
          } else {
            const errorData = await res.json()
            toast({
              title: "Error",
              description: errorData.error || "Invalid invitation",
              variant: "destructive",
            })
            navigate("/interviewee/dashboard")
            return
          }
        } else {
          // Handle regular test assessment or invitation that was already accepted
          const res = await fetch(`${import.meta.env.VITE_API_URL}/public/test-assessments`, { credentials: "include" })
          const tests = await res.json()
          const test = tests.find((t) => String(t.id) === String(id))
          
          if (test) {
            setAssessment(test)
          } else {
            // If not found in test assessments, try to get it directly (for invitation assessments)
            const res2 = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/assessment/${id}`, { credentials: "include" })
            if (res2.ok) {
              const assessmentData = await res2.json()
              setAssessment(assessmentData)
            } else {
              console.error("Assessment not found")
              setAssessment(null)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching assessment data:", err)
        setAssessment(null)
      }
      setLoading(false)
    }
    fetchAssessmentData()
  }, [id])

  // Fetch attempt data separately
  useEffect(() => {
    async function fetchAttemptData() {
      if (attemptId && attemptId !== "undefined") {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/assessments/${id}/attempt`, { credentials: "include" })
          if (res.ok) {
            const att = await res.json()
            setAttempt(att)
            setAnswers(att.answers || {})
            setCurrentQuestionIndex(att.current_question || 0)
          }
        } catch (err) {
          console.error("Error fetching attempt data:", err)
          setAttempt(null)
        }
      }
    }
    fetchAttemptData()
  }, [id, attemptId])

  if (loading || !assessment) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  const questions = assessment.questions || []
  const totalQuestions = questions.length
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const handleAnswerChange = async (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Save answer to backend
    if (attemptId) {
      const requestBody = { 
        question_id: questionId, 
        answer: value, 
        next_question: currentQuestionIndex + 1 
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Answer submission failed:", errorData)
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Run code only (no test cases)
  const handleRunCodeOnly = async () => {
    setInputError("")
    setTimeoutError("")
    if (!userInput.trim()) {
      setInputError("Please provide input for your code.")
      return
    }
    setCodeRunning(true)
    setCodeOnlyOutput("")
    setTestCaseResults([])
    setCodeOutput("")
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: answers[currentQuestion.id] || currentQuestion.starter_code || "",
          language: codeLanguage,
          input: userInput,
          test_cases: [],
        }),
      })
      const data = await res.json()
      if (data.error) {
        setCodeOnlyOutput(data.error)
      } else if (data.output) {
        setCodeOnlyOutput(data.output)
      } else {
        setCodeOnlyOutput("No output.")
      }
    } catch (err) {
      setCodeOnlyOutput(err.message || "Error running code.")
    }
    setCodeRunning(false)
  }

  // Run all test cases
  const handleRunTestCases = async () => {
    setCodeRunning(true)
    setTestCaseResults([])
    setCodeOutput("")
    setCodeOnlyOutput("")
    setTimeoutError("")
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: answers[currentQuestion.id] || currentQuestion.starter_code || "",
          language: codeLanguage,
          test_cases: currentQuestion.test_cases ? JSON.parse(currentQuestion.test_cases) : [],
        }),
      })
      const data = await res.json()
      if (data.timeout) {
        setTimeoutError(data.output || "Error: Code execution timed out (possible infinite loop)")
        setTestCaseResults([])
        setCodeOnlyOutput("")
      } else if (data.test_case_results && data.test_case_results.length > 0) {
        // Check if the first test case result is a compile/runtime error for all cases
        const allError = data.test_case_results.every(r => r.error && !r.output)
        if (allError) {
          setTimeoutError(data.test_case_results[0].error || "Error running code.")
          setTestCaseResults([])
        } else {
          setTestCaseResults(data.test_case_results)
        }
        setCodeOnlyOutput("")
      } else {
        setTestCaseResults([])
        setCodeOnlyOutput("No output.")
      }
    } catch (err) {
      setTimeoutError("Error running code.")
      setTestCaseResults([])
      setCodeOnlyOutput("")
    }
    setCodeRunning(false)
  }

  // Show confirmation dialog before submit
  const handleSubmitAssessment = async () => {
    setShowSubmitDialog(true)
  }
  const confirmSubmitAssessment = async () => {
    setShowSubmitDialog(false)
    if (attemptId) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/attempts/${attemptId}/submit`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        toast({
          title: "Assessment submitted!",
          description: `Score: ${data.score}%. ${data.passed ? "Passed" : "Failed"}`,
          variant: data.passed ? "default" : "destructive",
        })
        navigate("/interviewee/results")
      } else {
        toast({
          title: "Submission failed",
          description: "Could not submit assessment",
          variant: "destructive",
        })
      }
    }
  }

  const handleAcceptInvitation = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invitations/${invitationId}/accept`, {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setShowInvitationDialog(false)
        toast({
          title: "Invitation Accepted",
          description: "You can now start the assessment",
        })
        window.location.href = `/interviewee/assessment/${id}?attempt=${data.attempt_id}`
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to accept invitation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      })
    }
  }

  // Helper to get parsed test cases for the current question
  const getParsedTestCases = (q) => {
    if (!q) return [];
    if (Array.isArray(q.test_cases)) return q.test_cases;
    if (typeof q.test_cases === 'string') {
      try {
        return JSON.parse(q.test_cases)
      } catch {
        return []
      }
    }
    return [];
  }

  return (
    <div className="flex h-screen bg-background">
      <IntervieweeSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
          <Card className="w-full max-w-5xl p-6 shadow-lg">
            {/* Timer at the top */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Time Left: {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
              </div>
              <div className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {totalQuestions}</div>
            </div>
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl">Assessment: {assessment.title || id}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </CardDescription>
              <Progress value={progress} className="w-full mt-2" />
            </CardHeader>
            <CardContent className="p-0 space-y-8">
              <div className="mb-2">
                <h2 className="text-xl font-semibold mb-2">{currentQuestion?.question}</h2>
                {currentQuestion?.explanation && (
                  <div className="text-muted-foreground text-sm mb-2">{currentQuestion.explanation}</div>
                )}
              </div>

              {/* Multiple Choice */}
              {currentQuestion?.type === "multiple-choice" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <div key={option + idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option + idx} />
                      <Label htmlFor={option + idx}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Short Answer */}
              {currentQuestion?.type === "short-answer" && (
                <Textarea
                  placeholder="Type your answer..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  rows={4}
                  className="min-h-[100px]"
                />
              )}

              {/* Essay */}
              {currentQuestion?.type === "essay" && (
                <Textarea
                  placeholder="Write your essay answer..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  rows={10}
                  className="min-h-[200px]"
                />
              )}

              {/* Coding Challenge */}
              {currentQuestion?.type === "coding" && (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Label>Code Editor</Label>
                    <Select
                        value={codeLanguage}
                        onValueChange={setCodeLanguage}
                        className="w-[120px] h-8"
                      >
                        <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <div className="rounded border overflow-hidden mb-2" style={{ minHeight: 300 }}>
                      <MonacoEditor
                        height="300px"
                        language={codeLanguage}
                        theme="vs-dark"
                        value={answers[currentQuestion.id] || currentQuestion.starter_code || ""}
                        onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
                  />
                    </div>
                    {/* Input box for Run Code only */}
                    <div className="mb-2">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="input parameter goes here"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        disabled={codeRunning}
                      />
                      {inputError && <div className="text-xs text-red-400 mt-1">{inputError}</div>}
                    </div>
                    <div className="flex gap-2 w-full mb-2">
                      <Button onClick={handleRunCodeOnly} className="flex-1" disabled={codeRunning} variant="secondary">
                        {codeRunning ? "Running..." : "Run Code"}
                      </Button>
                      <Button onClick={handleRunTestCases} className="flex-1" disabled={codeRunning} variant="default">
                        {codeRunning ? "Running..." : "Run Test Cases"}
                  </Button>
                    </div>


                  </div>
                  <div className="flex-1 min-w-[250px] flex flex-col">
                    <Label className="mb-2 flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      Output / Debugger
                    </Label>
                    <div className="bg-black text-green-200 p-4 rounded-md text-sm overflow-auto flex-1 min-h-[200px] max-h-[350px]">
                      {codeRunning ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Loader2 className="animate-spin h-8 w-8 mb-2 text-blue-400" />
                          <span className="text-blue-200">Running...</span>
                        </div>
                      ) : timeoutError ? (
                        <div className="text-red-400 font-bold text-center">{timeoutError}</div>
                      ) : testCaseResults.length > 0 ? (
                        <div>
                          {testCaseResults.map((r, idx) => (
                            <div key={idx} className="mb-2 p-2 rounded border border-gray-700 bg-gray-900 flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-gray-400">Test {idx + 1}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.passed ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{r.passed ? 'PASS' : 'FAIL'}</span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs">
                                <span><span className="text-gray-400">Input:</span> <span className="font-mono">{r.input}</span></span>
                                <span><span className="text-gray-400">Output:</span> <span className={r.error ? 'text-red-400 font-mono' : 'text-green-200 font-mono'}>{r.output || r.error || 'No output.'}</span></span>
                                <span><span className="text-gray-400">Expected:</span> <span className="font-mono">{r.expected}</span></span>
                              </div>
                              {r.error && (
                                <div className="mt-1 text-xs text-red-400 whitespace-pre-line font-mono">{r.error}</div>
                              )}
                            </div>
                          ))}
                          <div className="mt-2 text-center">
                            {testCaseResults.every(r => r.passed) ? (
                              <span className="inline-block px-3 py-1 rounded bg-green-800 text-green-100 font-bold">All test cases passed!</span>
                            ) : testCaseResults.some(r => r.passed) ? (
                              <span className="inline-block px-3 py-1 rounded bg-yellow-800 text-yellow-100 font-bold">Some test cases failed.</span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded bg-red-800 text-red-100 font-bold">All test cases failed.</span>
                            )}
                          </div>
                        </div>
                      ) : codeOnlyOutput ? (
                        <pre className={codeOnlyOutput.toLowerCase().includes('error') || codeOnlyOutput.toLowerCase().includes('exception') ? 'text-red-400' : 'text-green-200'}>{codeOnlyOutput}</pre>
                      ) : (
                        <pre>Output will appear here after you run your code.</pre>
                      )}
                    </div>
                  </div>
                </div>
              )}



              <div className="flex justify-between mt-6">
                <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
                  Previous
                </Button>
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <DialogTrigger asChild>
                  <Button onClick={handleSubmitAssessment} variant="success">
                    Submit Assessment
                  </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Assessment</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to submit your assessment? You will not be able to change your answers after submission.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmSubmitAssessment}>Yes, Submit</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Invitation Dialog */}
      <Dialog open={showInvitationDialog} onOpenChange={setShowInvitationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assessment Invitation</DialogTitle>
            <DialogDescription>
              You have been invited to take this assessment. Please review the details below and accept the invitation to begin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{assessment?.title}</h3>
              <p className="text-sm text-muted-foreground">{assessment?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Duration:</span> {assessment?.duration} minutes
              </div>
              <div>
                <span className="font-medium">Difficulty:</span> {assessment?.difficulty}
              </div>
            </div>
            {assessment?.message && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{assessment.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/interviewee/dashboard")}>
              Decline
            </Button>
            <Button onClick={handleAcceptInvitation}>
              Accept Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



