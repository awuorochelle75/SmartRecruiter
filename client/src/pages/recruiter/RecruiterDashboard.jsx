"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, FileText, BarChart3, TrendingUp, Award, Calendar, Plus, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { DashboardSkeleton } from "../../components/LoadingSkeleton"

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])



  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/recruiter`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  const formatInterviewTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
                <p className="text-muted-foreground">Manage your assessments and track candidate performance</p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/recruiter/create-assessment">
                    <span className="inline-flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assessment
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" className="bg-transparent" asChild>
                  <Link to="/recruiter/send-invites">
                    <span className="inline-flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Invite Candidates
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Assessments</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.active_assessments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.assessments || "+0 this week"}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.total_candidates || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.candidates || "+0 this week"}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.completion_rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.completion_rate || "+0% from last month"}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
                  <Award className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(dashboardData?.stats?.average_score || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.average_score || "+0 points"}</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Candidates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Candidate Activity</span>
                  </CardTitle>
                  <CardDescription>Latest submissions and progress updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recent_candidates?.length > 0 ? (
                      dashboardData.recent_candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.email}</p>
                            <p className="text-xs text-muted-foreground">{candidate.assessment}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge
                              variant={candidate.status === "completed" ? "default" : "secondary"}
                              className={
                                candidate.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }
                            >
                              {candidate.status}
                            </Badge>
                            {candidate.score && (
                              <p className="text-sm font-medium text-foreground">Score: {Math.round(candidate.score)}%</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {candidate.status === "completed" 
                                ? formatTimeAgo(candidate.completed_at)
                                : `Started ${formatTimeAgo(candidate.submitted_at)}`
                              }
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/recruiter/assessments/${candidate.assessment_id}/results`}>
                              <span>
                                <Eye className="h-4 w-4" />
                              </span>
                            </Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No recent candidate activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Interviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Upcoming Interviews</span>
                  </CardTitle>
                  <CardDescription>Scheduled interviews for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.upcoming_interviews?.length > 0 ? (
                      dashboardData.upcoming_interviews.map((interview) => (
                        <div key={interview.id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-foreground">{interview.candidate}</h4>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to="/recruiter/interviews">
                                <span>
                                  <Eye className="h-4 w-4" />
                                </span>
                              </Link>
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">{interview.position}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{formatInterviewTime(interview.time)}</span>
                            <Badge variant="outline">{interview.type}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No upcoming interviews</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assessment Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Assessment Performance Overview</span>
                </CardTitle>
                <CardDescription>Performance metrics across all active assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardData?.category_performance?.length > 0 ? (
                    dashboardData.category_performance.slice(0, 3).map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">{Math.round(category.average_score)}% avg</span>
                        </div>
                        <Progress value={Math.round(category.average_score)} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-muted-foreground">No assessment performance data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}



