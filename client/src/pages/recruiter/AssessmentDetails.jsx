"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, Users, CheckCircle, AlertCircle, FileText, Eye, Award, Calendar } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Separator } from "../../components/ui/separator"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { TableSkeleton } from "../../components/LoadingSkeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../../components/ui/dialog"



export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [analytics, setAnalytics] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [reviewCandidate, setReviewCandidate] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewAttempt, setReviewAttempt] = useState(null)
  const [reviewQuestions, setReviewQuestions] = useState([])
  const [codeResults, setCodeResults] = useState({})
  const [submissions, setSubmissions] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/assessments/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch assessment');
        return res.json();
      })
      .then(data => {
        setAssessment(data);
        setLoading(false);
      })
      .catch(() => {
        setAssessment(null);
        setLoading(false);
      });
    fetch(`${import.meta.env.VITE_API_URL}/assessments/${id}/results`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setSubmissions(data))
      .catch(() => setSubmissions([]))
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [id]);




  useEffect(() => {
    async function fetchAnalyticsAndFeedback() {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/recruiter/assessment/${id}`, { credentials: "include" })
      if (res.ok) setAnalytics(await res.json())
      const res2 = await fetch(`${import.meta.env.VITE_API_URL}/feedback/assessment/${id}`, { credentials: "include" })
      if (res2.ok) setFeedbacks(await res2.json())
    }
    fetchAnalyticsAndFeedback()
  }, [id])




  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }




  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }



  const handleEdit = () => {
    navigate(`/recruiter/edit-assessment/${id}`);
  };

  const handleTogglePublish = async () => {
    if (!assessment) return;
    setPublishing(true);
    const newStatus = assessment.status === "active" ? "draft" : "active";
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assessments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...assessment, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setAssessment((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
    } finally {
      setPublishing(false);
    }
  };

  const handleReviewCandidate = async (candidate) => {
    setReviewCandidate(candidate)
    setReviewOpen(true)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/assessments/${id}/attempt`, { credentials: "include" })
    if (res.ok) {
      const att = await res.json()
      setReviewAttempt(att)
      const res2 = await fetch(`${import.meta.env.VITE_API_URL}/public/test-assessments`, { credentials: "include" })
      if (res2.ok) {
        const tests = await res2.json()
        const test = tests.find((t) => String(t.id) === String(id))
        setReviewQuestions(test?.questions || [])
      }
      const resultsObj = {}
      for (const q of (test?.questions || [])) {
        if (q.type === "coding" && att.answers?.[q.id]) {
          const res3 = await fetch(`${import.meta.env.VITE_API_URL}/code-eval/${att.answers[q.id]}`, { credentials: "include" })
          if (res3.ok) resultsObj[q.id] = await res3.json()
        }
      }
      setCodeResults(resultsObj)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <TableSkeleton />
          </main>
        </div>
      </div>
    )
  }



  if (!assessment) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Card className="w-full max-w-md text-center p-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Assessment Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The assessment you are looking for does not exist or has been deleted.
              </p>
              <Link to="/recruiter/assessments">
                <Button variant="outline">Go back to Assessments</Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    )
  }



  return (
    <div className="w-full bg-muted/40 flex">
      <div className="fixed left-0 top-0 h-screen z-30">
        <RecruiterSidebar />
      </div>
      <div className="flex-1 flex flex-col ml-64">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-10 max-w-4xl mx-auto pt-4">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Link to="/recruiter/assessments">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Assessments</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground leading-tight">{assessment.title}</h1>
                  <p className="text-muted-foreground text-base mt-1">{assessment.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEdit}>Edit Assessment</Button>
                <Button onClick={handleTogglePublish} disabled={publishing}>
                  {assessment.status === "active" ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </div>




            {/* Assessment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  {getStatusIcon(assessment.status)}
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(assessment.status)}>
                    <span className="capitalize">{assessment.status}</span>
                  </Badge>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Type</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{assessment.type}</div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessment.duration} min</div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Candidates Invited</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessment.candidatesCount || 0}</div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created On</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : '-'}</div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : '-'}</div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Category</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.find(c => String(c.id) === String(assessment.category_id))?.name || "Uncategorized"}</div>
                </CardContent>
              </Card>
            </div>




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



            <Card className="shadow-md mb-10">
              <CardHeader>
                <CardTitle>Candidate Submissions</CardTitle>
                <CardDescription>
                  Overview of candidates who have taken or been invited to this assessment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Time Spent</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((candidate) => (
                        <TableRow key={candidate.attempt_id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img src={candidate.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${candidate.avatar}` : "/placeholder.svg"} alt={candidate.candidate_name} className="h-8 w-8 rounded-full object-cover" />
                              <div>
                                <div className="font-medium">{candidate.candidate_name}</div>
                                <div className="text-sm text-muted-foreground">{candidate.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {candidate.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{candidate.score !== null ? Number(candidate.score).toFixed(1) : "N/A"}</TableCell>
                          <TableCell>{candidate.time_spent > 0 ? `${Math.floor(candidate.time_spent / 60)}:${(candidate.time_spent % 60).toString().padStart(2, '0')} min` : "-"}</TableCell>
                          <TableCell>{candidate.completed_at ? new Date(candidate.completed_at).toLocaleString() : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            {(candidate.status === "completed" || candidate.status === "pending_review") && (
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review Submission
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No candidates have interacted with this assessment yet.
                  </div>
                )}
              </CardContent>
            </Card>
            


            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Assessment Feedback</CardTitle>
                <CardDescription>Feedback from interviewees about this assessment.</CardDescription>
              </CardHeader>
              <CardContent>
                {feedbacks.length > 0 ? (
                  <ul className="space-y-4">
                    {feedbacks.map(f => (
                      <li key={f.id} className="border-b pb-2">
                        <div className="font-semibold">Rating: {f.rating || "N/A"} / 5</div>
                        <div className="text-sm text-muted-foreground">{f.feedback}</div>
                        <div className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No feedback yet.</div>
                )}
              </CardContent>
            </Card>
            


            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Assessment Performance Overview</CardTitle>
                <CardDescription>System-generated statistics and insights for this assessment.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] flex items-center justify-center text-muted-foreground">
                {analytics ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-semibold">Total Attempts:</span> {analytics.total_attempts}</div>
                    <div><span className="font-semibold">Completed:</span> {analytics.completed_attempts}</div>
                    <div><span className="font-semibold">Average Score:</span> {analytics.average_score.toFixed(1)}%</div>
                    <div><span className="font-semibold">Pass Rate:</span> {analytics.pass_rate.toFixed(1)}%</div>
                    <div><span className="font-semibold">Feedback Count:</span> {analytics.feedback_count}</div>
                    <div><span className="font-semibold">Average Feedback Rating:</span> {analytics.average_feedback_rating ? analytics.average_feedback_rating.toFixed(2) : 'N/A'} / 5</div>
                  </div>
                ) : (
                  <div className="text-center w-full">
                  <Award className="h-12 w-12 mx-auto mb-4" />
                  <p>Performance analytics will appear here once enough data is available.</p>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
 


