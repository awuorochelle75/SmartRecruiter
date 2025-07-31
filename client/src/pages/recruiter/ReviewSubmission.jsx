import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Calendar,
  Save,
  Send,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  FileText,
  Code,
  CheckSquare,
  Square
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Textarea } from "../../components/ui/textarea"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Separator } from "../../components/ui/separator"
import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"

export default function ReviewSubmission() {
  const { assessmentId, attemptId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showReviewNotes, setShowReviewNotes] = useState({})
  const [debounceTimers, setDebounceTimers] = useState({})
  const [pendingUpdates, setPendingUpdates] = useState({})
  const [savingStatus, setSavingStatus] = useState({})

  useEffect(() => {
    fetchSubmission()
  }, [assessmentId, attemptId])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [debounceTimers])

  // Save pending changes when component unmounts
  useEffect(() => {
    return () => {
      if (Object.keys(pendingUpdates).length > 0 && submission) {
        // Save any pending changes before unmounting
        Object.entries(pendingUpdates).forEach(async ([questionId, updates]) => {
          try {
            await fetch(
              `${import.meta.env.VITE_API_URL}/assessments/reviews/${submission.review_id}/answers/${questionId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updates),
              }
            )
          } catch (error) {
            console.error("Error saving pending changes:", error)
          }
        })
      }
    }
  }, [pendingUpdates, submission])

  const fetchSubmission = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/submissions/${attemptId}/review`,
        { credentials: "include" }
      )
      if (res.ok) {
        const data = await res.json()
        setSubmission(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load submission",
          variant: "destructive",
        })
        navigate("/recruiter/assessments")
      }
    } catch (error) {
      console.error("Error fetching submission:", error)
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuestionScore = useCallback(async (questionId, updates) => {
    if (!submission) return

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/assessments/reviews/${submission.review_id}/answers/${questionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        }
      )
      
      if (res.ok) {
        // Update local state with server response
        setSubmission(prev => ({
          ...prev,
          questions: prev.questions.map(q => 
            q.question_id === questionId 
              ? { ...q, ...updates }
              : q
          )
        }))
        
        // Show success toast
        toast({
          title: "Saved",
          description: "Question score updated",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update score",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating score:", error)
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      })
    }
  }, [submission, toast])

  const debouncedUpdateQuestionScore = useCallback((questionId, updates, delay = 1000) => {
    // Clear existing timer for this question
    if (debounceTimers[questionId]) {
      clearTimeout(debounceTimers[questionId])
    }

    // Update local state immediately for UI responsiveness
    setSubmission(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.question_id === questionId 
          ? { ...q, ...updates }
          : q
      )
    }))

    // Show saving status
    setSavingStatus(prev => ({
      ...prev,
      [questionId]: 'pending'
    }))

    // Accumulate updates for this question
    setPendingUpdates(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...updates }
    }))

    // Set new timer for API call
    const timer = setTimeout(async () => {
      // Get the accumulated updates for this question
      const accumulatedUpdates = pendingUpdates[questionId] || updates
      
      // Clear pending updates for this question
      setPendingUpdates(prev => {
        const newPending = { ...prev }
        delete newPending[questionId]
        return newPending
      })
      
      // Show saving status
      setSavingStatus(prev => ({
        ...prev,
        [questionId]: 'saving'
      }))
      
      // Make API call with accumulated updates
      await updateQuestionScore(questionId, accumulatedUpdates)
      
      // Clear saving status
      setSavingStatus(prev => {
        const newStatus = { ...prev }
        delete newStatus[questionId]
        return newStatus
      })
    }, delay)

    setDebounceTimers(prev => ({
      ...prev,
      [questionId]: timer
    }))
  }, [debounceTimers, pendingUpdates, updateQuestionScore])

  const completeReview = async () => {
    if (!submission) return
    
    setSaving(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/assessments/reviews/${submission.review_id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            overall_feedback: submission.overall_feedback || ""
          }),
        }
      )
      
      if (res.ok) {
        const data = await res.json()
        setSubmission(prev => ({
          ...prev,
          review_status: 'completed',
          final_score: data.final_score
        }))
        
        toast({
          title: "Review Completed",
          description: `Final score: ${data.final_score.toFixed(1)}%`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to complete review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error completing review:", error)
      toast({
        title: "Error",
        description: "Failed to complete review",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveAllPendingChanges = async () => {
    if (!submission || Object.keys(pendingUpdates).length === 0) return
    
    setSaving(true)
    try {
      // Save all pending updates
      const savePromises = Object.entries(pendingUpdates).map(([questionId, updates]) =>
        updateQuestionScore(parseInt(questionId), updates)
      )
      
      await Promise.all(savePromises)
      
      // Clear all pending updates
      setPendingUpdates({})
      
      toast({
        title: "All Changes Saved",
        description: "All pending changes have been saved",
      })
    } catch (error) {
      console.error("Error saving all changes:", error)
      toast({
        title: "Error",
        description: "Failed to save some changes",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const releaseResults = async () => {
    if (!submission) return
    
    setSaving(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/assessments/reviews/${submission.review_id}/release`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      )
      
      if (res.ok) {
        toast({
          title: "Results Released",
          description: "Candidate has been notified of their results",
        })
        navigate("/recruiter/assessments")
      } else {
        toast({
          title: "Error",
          description: "Failed to release results",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error releasing results:", error)
      toast({
        title: "Error",
        description: "Failed to release results",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const renderQuestionAnswer = (question) => {
    const isCorrect = question.manual_is_correct ?? question.auto_is_correct
    const score = question.manual_score ?? question.auto_score ?? 0
    
    return (
      <div className="space-y-4">
        {/* Question */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{question.type}</Badge>
            <Badge variant="secondary">{question.points} points</Badge>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className="text-sm font-medium">{question.question}</p>
          
          {/* Question-specific details */}
          {question.type === "multiple-choice" && question.options && (
            <div className="mt-3 space-y-2">
              <RadioGroup value={question.answer || ""} disabled>
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${idx}`} 
                    />
                    <Label htmlFor={`option-${idx}`} className="text-sm">
                      {option}
                      {question.correct_answer === idx && (
                        <Badge variant="outline" className="ml-2">Correct</Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          
          {question.type === "coding" && question.starter_code && (
            <div className="mt-3">
              <Label className="text-sm font-medium">Starter Code:</Label>
              <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                {question.starter_code}
              </pre>
            </div>
          )}
        </div>

        {/* Candidate's Answer */}
        <div className="bg-background border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <Label className="text-sm font-medium">Candidate's Answer:</Label>
          </div>
          
          {question.type === "coding" ? (
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              {question.answer || "No code submitted"}
            </pre>
          ) : question.type === "essay" ? (
            <div className="bg-muted p-3 rounded text-sm">
              {question.answer || "No answer submitted"}
            </div>
          ) : (
            <p className="text-sm">{question.answer || "No answer submitted"}</p>
          )}
        </div>

        {/* Scoring Section */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">Manual Scoring</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Auto Score:</span>
              <Badge variant="outline">{question.auto_score}/{question.points}</Badge>
              {savingStatus[question.question_id] && (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  <span className="text-xs text-muted-foreground">
                    {savingStatus[question.question_id] === 'pending' ? 'Pending...' : 'Saving...'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Score (0-{question.points})</Label>
              <Input
                type="number"
                min="0"
                max={question.points}
                value={question.manual_score ?? question.auto_score ?? 0}
                onChange={(e) => debouncedUpdateQuestionScore(question.question_id, {
                  manual_score: parseFloat(e.target.value) || 0
                }, 2000)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-xs">Correct?</Label>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`correct-${question.question_id}`}
                    name={`correct-${question.question_id}`}
                    checked={question.manual_is_correct ?? question.auto_is_correct}
                    onChange={() => debouncedUpdateQuestionScore(question.question_id, {
                      is_correct: true
                    }, 1000)}
                  />
                  <Label htmlFor={`correct-${question.question_id}`} className="text-xs">Correct</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`incorrect-${question.question_id}`}
                    name={`correct-${question.question_id}`}
                    checked={!(question.manual_is_correct ?? question.auto_is_correct)}
                    onChange={() => debouncedUpdateQuestionScore(question.question_id, {
                      is_correct: false
                    }, 1000)}
                  />
                  <Label htmlFor={`incorrect-${question.question_id}`} className="text-xs">Incorrect</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Label className="text-xs">Feedback for Candidate</Label>
            <Textarea
              placeholder="Provide constructive feedback..."
              value={question.feedback || ""}
              onChange={(e) => debouncedUpdateQuestionScore(question.question_id, {
                feedback: e.target.value
              }, 2000)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReviewNotes(prev => ({
                  ...prev,
                  [question.question_id]: !prev[question.question_id]
                }))}
              >
                {showReviewNotes[question.question_id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Review Notes
              </Button>
            </div>
            {showReviewNotes[question.question_id] && (
              <Textarea
                placeholder="Internal notes (not visible to candidate)..."
                value={question.review_notes || ""}
                onChange={(e) => debouncedUpdateQuestionScore(question.question_id, {
                  review_notes: e.target.value
                }, 2000)}
                className="mt-1"
                rows={2}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading submission...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="text-center">
              <p>Submission not found</p>
              <Button onClick={() => navigate("/recruiter/assessments")}>
                Back to Assessments
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const currentQuestion = submission.questions[currentQuestionIndex]
  const totalQuestions = submission.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/recruiter/assessments")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Review Submission</h1>
                  <p className="text-muted-foreground">
                    {submission.assessment_title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {Object.keys(pendingUpdates).length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={saveAllPendingChanges} 
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : `Save All (${Object.keys(pendingUpdates).length})`}
                  </Button>
                )}
                {submission.review_status === 'completed' ? (
                  <Button onClick={releaseResults} disabled={saving}>
                    <Send className="h-4 w-4 mr-2" />
                    {saving ? "Releasing..." : "Release Results"}
                  </Button>
                ) : (
                  <Button onClick={completeReview} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Complete Review"}
                  </Button>
                )}
              </div>
            </div>

            {/* Candidate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{submission.candidate_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Time spent: {Math.floor(submission.time_spent / 60)}:{(submission.time_spent % 60).toString().padStart(2, '0')} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Completed: {new Date(submission.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Auto Score</Label>
                    <p className="text-lg font-semibold">{submission.auto_score?.toFixed(1) || 0}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Final Score</Label>
                    <p className="text-lg font-semibold">{submission.final_score?.toFixed(1) || "Pending"}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={submission.review_status === 'completed' ? 'default' : 'secondary'}>
                      {submission.review_status === 'completed' ? 'Reviewed' : 'In Review'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Overall Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Provide overall feedback for the candidate..."
                  value={submission.overall_feedback || ""}
                  onChange={(e) => setSubmission(prev => ({
                    ...prev,
                    overall_feedback: e.target.value
                  }))}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {submission.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === totalQuestions - 1}
              >
                Next
              </Button>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <Card>
                <CardContent className="p-6">
                  {renderQuestionAnswer(currentQuestion)}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 