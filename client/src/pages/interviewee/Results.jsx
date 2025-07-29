"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { TableSkeleton } from "../../components/LoadingSkeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { useToast } from "../../components/ui/use-toast"
import { useAuth } from "../../contexts/AuthContext"

export default function Results() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("score")
  const [results, setResults] = useState([])
  const [detailedAttempt, setDetailedAttempt] = useState(null)
  const [detailedQuestions, setDetailedQuestions] = useState([])
  const [detailedOpen, setDetailedOpen] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [codeResults, setCodeResults] = useState({})
  const { toast } = useToast();
  
  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFeedbackAssessment, setSelectedFeedbackAssessment] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user } = useAuth();
  const [feedbackStatus, setFeedbackStatus] = useState({});
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewAttempt, setSelectedReviewAttempt] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  // Star rating handler
  const handleStarClick = (star) => {
    setFeedbackRating(star);
  };

  const handleOpenFeedbackDialog = (assessment) => {
    setSelectedFeedbackAssessment(assessment);
    setFeedbackDialogOpen(true);
    setFeedbackText("");
    setFeedbackRating(5);
    setFeedbackSubmitted(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedbackAssessment) return;
    setFeedbackSubmitting(true);
    await fetch(`${import.meta.env.VITE_API_URL}/feedback/assessment/${selectedFeedbackAssessment.assessment_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feedback: feedbackText, rating: feedbackRating }),
    });
    setFeedbackSubmitting(false);
    setFeedbackSubmitted(true);
    setFeedbackStatus(prev => ({
      ...prev,
      [selectedFeedbackAssessment.assessment_id]: { submitted: true, feedback: feedbackText, rating: feedbackRating }
    }));
    toast({ title: "Feedback submitted!", description: `Thank you for your feedback on '${selectedFeedbackAssessment.assessment_title}'.`, variant: "default" });
  };

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/attempts/summary?t=${Date.now()}`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        } else {
          setResults([])
        }
      } catch (err) {
        console.error('Error fetching results:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    async function fetchAnalytics() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/interviewee/summary`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (err) {
        console.error("Error fetching analytics:", err)
      }
    }

    async function fetchCodeResults() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/code-eval/results`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setCodeResults(data)
        }
      } catch (err) {
        console.error("Error fetching code results:", err)
      }
    }

    async function fetchFeedbackStatus() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/feedback/status`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setFeedbackStatus(data)
        }
      } catch (err) {
        console.error("Error fetching feedback status:", err)
      }
    }

    fetchResults()
    fetchAnalytics()
    fetchCodeResults()
    fetchFeedbackStatus()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (result) => {
    if (result.status === "completed") {
      return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>
    } else if (result.status === "in_progress") {
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />In Progress</Badge>
    } else {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Failed</Badge>
    }
  }



  const handleViewDetails = async (assessmentId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/assessments/${assessmentId}/attempt`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setDetailedAttempt(data)
        // Fetch assessment to get questions
        const res2 = await fetch(`${import.meta.env.VITE_API_URL}/public/test-assessments`, { credentials: "include" })
        if (res2.ok) {
          const tests = await res2.json()
          const test = tests.find((t) => String(t.id) === String(assessmentId))
          setDetailedQuestions(test?.questions || [])
        } else {
          setDetailedQuestions([])
        }
        setDetailedOpen(true)
      }
    } catch (err) {
      setDetailedAttempt(null)
      setDetailedQuestions([])
      setDetailedOpen(false)
    }
  }

  const handleViewReview = async (attemptId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/attempts/${attemptId}/review`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setReviewData(data)
        setSelectedReviewAttempt(attemptId)
        setReviewDialogOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load review details",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load review details",
        variant: "destructive",
      })
    }
  }

  const handleExportResults = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/export/interviewee/results`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'assessment_results.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Results exported successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to export results",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive",
      })
    }
  }

  const filteredResults = results.filter(result => {
    const matchesSearch = result.assessment_title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || result.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return (b.score || 0) - (a.score || 0)
      case "date":
        return new Date(b.completed_at || 0) - new Date(a.completed_at || 0)
      case "name":
        return (a.assessment_title || "").localeCompare(b.assessment_title || "")
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <IntervieweeSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <TableSkeleton />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <IntervieweeSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Analytics Cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_attempts}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.completed_attempts}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.average_score.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.pass_rate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Results</h1>
                <p className="text-muted-foreground">View and analyze your assessment results and performance</p>
              </div>
              <Button onClick={handleExportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>



            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>My Assessment Results</CardTitle>
                <CardDescription>Detailed results for your completed assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedResults.map((result) => (
                        <TableRow key={result.attempt_id}>
                        <TableCell>
                          <div className="font-medium">{result.assessment_title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getScoreColor(result.score)}`}>
                              {result.status === "completed" || result.passed ? `${(result.score ?? 0).toFixed(1)}%` : "-"}
                            </span>
                            {(result.status === "completed" || result.passed) && <Progress value={result.score} className="w-16 h-2" />}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(result)}</TableCell>
                        <TableCell>
                          {result.has_review ? (
                            <div className="flex items-center gap-2">
                              <Badge variant={result.review_status === 'completed' ? 'default' : 'secondary'}>
                                {result.review_status === 'completed' ? 'Reviewed' : 'In Review'}
                              </Badge>
                              {result.final_score && (
                                <span className="text-sm text-muted-foreground">
                                  {result.final_score.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not reviewed</span>
                          )}
                        </TableCell>
                        <TableCell>{result.time_spent > 0 ? `${Math.round(result.time_spent / 60)} min` : "-"}</TableCell>
                        <TableCell>
                          {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog open={detailedOpen && detailedAttempt?.assessment_id === result.assessment_id} onOpenChange={setDetailedOpen}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(result.assessment_id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Assessment Details</DialogTitle>
                                  <DialogDescription>
                                    <div className="font-bold mb-2">{result.assessment_title}</div>
                                    <div>Score: {result.score.toFixed(1)}%</div>
                                    <div>Status: {getStatusBadge(result)}</div>
                                    <div>Completed: {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : "-"}</div>
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 space-y-4">
                                  {detailedQuestions.map((q, idx) => (
                                    <div key={q.id} className="border-b pb-2 mb-2">
                                      <div className="font-medium">Q{idx + 1}: {q.question}</div>
                                      <div className="text-sm mt-1">
                                        <span className="font-semibold">Your Answer:</span> {detailedAttempt?.answers?.[q.id] ?? <span className="italic text-muted-foreground">No answer</span>}
                                      </div>
                                      {q.type === "multiple-choice" && (
                                        <div className="text-sm">
                                          <span className="font-semibold">Correct Answer:</span> {Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : q.correct_answer}
                                        </div>
                                      )}
                                      {q.type === "coding" && (
                                        <div className="text-xs mt-2">
                                          <div className="font-semibold">Code Submitted:</div>
                                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-40 mb-2">{detailedAttempt?.answers?.[q.id]}</pre>
                                          {codeResults[q.id] && (
                                            <>
                                              <div className="font-semibold">Test Case Results:</div>
                                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-40 mb-2">{JSON.stringify(codeResults[q.id].test_case_results, null, 2)}</pre>
                                              <div>Score: {codeResults[q.id].score}</div>
                                              <div>Feedback: {codeResults[q.id].feedback}</div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {typeof detailedAttempt?.answers?.[q.id] !== "undefined" && q.type !== "coding" && (
                                        <div className="text-xs mt-1">
                                          {detailedAttempt?.answers?.[q.id] === (Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer) ? (
                                            <span className="text-green-600 font-semibold">Correct</span>
                                          ) : (
                                            <span className="text-red-600 font-semibold">Incorrect</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                            {result.has_review && result.review_status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewReview(result.attempt_id)}
                              >
                                View Review
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(result.status === "completed" || result.passed) && (
                            !feedbackStatus[result.assessment_id]?.submitted && (
                              <Dialog open={feedbackDialogOpen && selectedFeedbackAssessment?.assessment_id === result.assessment_id} onOpenChange={setFeedbackDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => handleOpenFeedbackDialog(result)}>
                                    Leave Feedback
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-full max-w-2xl min-w-[320px] sm:min-w-[480px] md:min-w-[600px] lg:min-w-[700px] p-0">
                                  <div className="p-4 sm:p-8 md:p-10">
                                    <DialogHeader className="mb-2">
                                      <DialogTitle className="text-2xl md:text-3xl font-bold mb-1 text-center">Leave Feedback</DialogTitle>
                                      <DialogDescription className="text-center text-muted-foreground mb-4 text-base md:text-lg">
                                        We value your input! Please rate and share your thoughts about <span className="font-semibold text-foreground">{result.assessment_title}</span>.
                                      </DialogDescription>
                                    </DialogHeader>
                                    {feedbackSubmitted ? (
                                      <div className="flex flex-col items-center justify-center py-10">
                                        <CheckCircle className="h-20 w-20 md:h-24 md:w-24 text-green-500 mb-4" />
                                        <div className="text-2xl md:text-3xl font-semibold text-green-700 dark:text-green-300 mb-2 text-center">Thank you for your feedback!</div>
                                        <div className="text-muted-foreground text-center text-base md:text-lg">We appreciate your help in improving our assessments.</div>
                                      </div>

                                    ) : (
                                      <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                                        <div>
                                          <label className="block mb-2 font-medium text-base md:text-lg">Your Feedback</label>
                                          <Textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Share your experience..." required rows={4} className="resize-none text-base md:text-lg" />
                                        </div>
                                        <div>
                                          <label className="block mb-2 font-medium text-base md:text-lg">Rating</label>
                                          <div className="flex items-center gap-1">
                                            {[1,2,3,4,5].map(star => (
                                              <button
                                                type="button"
                                                key={star}
                                                onClick={() => handleStarClick(star)}
                                                className="focus:outline-none"
                                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                              >
                                                <Star className={`h-8 w-8 md:h-10 md:w-10 ${star <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                              </button>
                                            ))}
                                            <span className="ml-2 text-base md:text-lg text-muted-foreground">{feedbackRating} / 5</span>
                                          </div>
                                        </div>
                                        <Button type="submit" disabled={feedbackSubmitting} className="w-full h-12 text-lg font-semibold mt-2">
                                          {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                                        </Button>
                                      </form>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Feedback</DialogTitle>
            <DialogDescription>
              {reviewData && (
                <div className="space-y-2">
                  <div className="font-bold">{reviewData.assessment_title}</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Auto Score: {reviewData.auto_score?.toFixed(1)}%</div>
                    <div>Final Score: {reviewData.final_score?.toFixed(1)}%</div>
                    <div>Review Status: {reviewData.review_status}</div>
                    <div>Reviewed: {reviewData.reviewed_at ? new Date(reviewData.reviewed_at).toLocaleDateString() : "Pending"}</div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {reviewData && (
            <div className="space-y-6">
              {/* Overall Feedback */}
              {reviewData.overall_feedback && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Overall Feedback</h3>
                  <p className="text-sm">{reviewData.overall_feedback}</p>
                </div>
              )}
              
              {/* Question Reviews */}
              <div className="space-y-4">
                <h3 className="font-semibold">Question-by-Question Review</h3>
                {reviewData.questions?.map((question, idx) => (
                  <div key={question.question_id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Question {idx + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant="secondary">{question.points} points</Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm">{question.question}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Your Answer:</span>
                        <div className="mt-1">
                          {question.type === 'coding' ? (
                            <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                              {question.answer || "No code submitted"}
                            </pre>
                          ) : (
                            <span>{question.answer || "No answer submitted"}</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-semibold">Scoring:</span>
                        <div className="mt-1 space-y-1">
                          <div>Auto Score: {question.auto_score}/{question.points}</div>
                          <div>Final Score: {question.final_score}/{question.points}</div>
                          <div>
                            Status: 
                            <Badge variant={question.final_is_correct ? "default" : "destructive"} className="ml-1">
                              {question.final_is_correct ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {question.feedback && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                        <span className="font-semibold text-sm">Feedback:</span>
                        <p className="text-sm mt-1">{question.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


