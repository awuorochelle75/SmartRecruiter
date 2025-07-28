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
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFeedbackAssessment, setSelectedFeedbackAssessment] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user } = useAuth();
  const [feedbackStatus, setFeedbackStatus] = useState({});

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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/attempts/summary`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        } else {
          setResults([])
        }
      } catch (err) {
        setResults([])
      }
      setLoading(false)
    }
    fetchResults()
  }, [])

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/interviewee/summary`, { credentials: "include" })
      if (res.ok) {
        setAnalytics(await res.json())
      }
    }
    fetchAnalytics()
  }, [])

  useEffect(() => {
    async function fetchCodeResults() {
      if (!detailedOpen || !detailedQuestions.length) return
      const resultsObj = {}
      for (const q of detailedQuestions) {
        if (q.type === "coding" && detailedAttempt?.answers?.[q.id]) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/code-eval/${detailedAttempt.answers[q.id]}`, { credentials: "include" })
          if (res.ok) {
            resultsObj[q.id] = await res.json()
          }
        }
      }
      setCodeResults(resultsObj)
    }
    fetchCodeResults()
  }, [detailedOpen, detailedQuestions, detailedAttempt])

  useEffect(() => {
    async function fetchFeedbackStatus() {
      if (!user || !results.length) return;
      const status = {};
      for (const result of results) {
        if (result.status === "completed" || result.passed) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/feedback/assessment/${result.assessment_id}`, { credentials: "include" });
          if (res.ok) {
            const feedbacks = await res.json();
            const myFeedback = feedbacks.find(fb => String(fb.user_id) === String(user.id));
            if (myFeedback) {
              status[result.assessment_id] = { submitted: true, feedback: myFeedback.feedback, rating: myFeedback.rating };
            } else {
              status[result.assessment_id] = { submitted: false };
            }
          } else {
            status[result.assessment_id] = { submitted: false };
          }
        }
      }
      setFeedbackStatus(status);
    }
    fetchFeedbackStatus();
  }, [user, results]);

  const filteredResults = results
    .filter((result) => {
      const matchesSearch =
        (result.assessment_title || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === "all" || (result.status || (result.passed ? "completed" : "failed")) === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.score || 0) - (a.score || 0)
        case "name":
          return (a.assessment_title || "").localeCompare(b.assessment_title || "")
        case "date":
          return new Date(b.completed_at || 0) - new Date(a.completed_at || 0)
        default:
          return 0
      }
    })

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (result) => {
    const status = result.status || (result.passed === true ? "completed" : result.passed === false ? "failed" : "in-progress")
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Results</h1>
                <p className="text-muted-foreground">View and analyze your assessment results and performance</p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>

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
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
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
                        <TableCell>{result.time_spent > 0 ? `${Math.round(result.time_spent / 60)} min` : "-"}</TableCell>
                        <TableCell>
                          {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
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
                                        <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40 mb-2">{detailedAttempt?.answers?.[q.id]}</pre>
                                        {codeResults[q.id] && (
                                          <>
                                            <div className="font-semibold">Test Case Results:</div>
                                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40 mb-2">{JSON.stringify(codeResults[q.id].test_case_results, null, 2)}</pre>
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
    </div>
  )
}


