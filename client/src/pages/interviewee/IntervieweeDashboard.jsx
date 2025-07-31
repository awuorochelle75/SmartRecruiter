"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Trophy, Clock, BookOpen, Target, TrendingUp, Award, Calendar, Play, CheckCircle, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../components/ui/use-toast"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { DashboardSkeleton } from "../../components/LoadingSkeleton"

export default function IntervieweeDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [invitations, setInvitations] = useState([])
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/interviewee`, {
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

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invitations`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    }
  }

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invitations/${invitationId}/accept`, {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Invitation Accepted",
          description: "You can now start the assessment",
        })
        // Navigate to the assessment
        window.location.href = `/interviewee/assessment/${data.assessment_id}?attempt=${data.attempt_id}`
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

  useEffect(() => {
    fetchDashboardData()
    fetchInvitations()
  }, [])

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
        <IntervieweeSidebar />
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
      <IntervieweeSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
                <p className="text-muted-foreground">Track your progress and discover new opportunities</p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/interviewee/practice">
                    <Play className="h-4 w-4 mr-2" />
                    Start Practice
                  </Link>
                </Button>
                <Button variant="outline" className="bg-transparent" asChild>
                  <Link to="/interviewee/tests">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Tests
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tests Completed</CardTitle>
                  <Trophy className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.tests_completed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.tests_completed || "+0 this week"}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(dashboardData?.stats?.average_score || 0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.average_score || "+0% improvement"}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Practice Sessions</CardTitle>
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.stats?.practice_sessions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.practice_sessions || "+0 this week"}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
                  <Award className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    #{dashboardData?.stats?.rank || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{dashboardData?.stats?.weekly_changes?.rank || "↑0 positions"}</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Assessment Invitations */}
            {invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Assessment Invitations</span>
                  </CardTitle>
                  <CardDescription>You have pending assessment invitations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-foreground">{invitation.assessment_title}</h4>
                          <Badge variant="outline" className="border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-200">
                            Invitation
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{invitation.company_name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{invitation.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{invitation.assessment_duration} min</span>
                            <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                          </div>
                          <Button size="sm" onClick={() => handleAcceptInvitation(invitation.id)}>
                            Accept Invitation
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Available Tests</span>
                  </CardTitle>
                  <CardDescription>New assessment opportunities waiting for you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.available_tests?.length > 0 ? (
                      dashboardData.available_tests.map((test) => (
                        <div key={test.id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-foreground">{test.title}</h4>
                            <Badge
                              variant="outline"
                              className={
                                test.difficulty === "Advanced"
                                  ? "border-red-200 text-red-800 dark:border-red-800 dark:text-red-200"
                                  : test.difficulty === "Intermediate"
                                    ? "border-yellow-200 text-yellow-800 dark:border-yellow-800 dark:text-yellow-200"
                                    : "border-green-200 text-green-800 dark:border-green-800 dark:text-green-200"
                              }
                            >
                              {test.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{test.company}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{test.duration}</span>
                              <span>{test.deadline}</span>
                            </div>
                            <Button size="sm" asChild>
                              <Link to={`/interviewee/assessment/${test.id}`}>Start Test</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No available tests at the moment</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Recent Results</span>
                  </CardTitle>
                  <CardDescription>Your latest assessment performances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recent_results?.length > 0 ? (
                      dashboardData.recent_results.map((result) => (
                        <div key={result.id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-foreground">{result.assessment}</h4>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">{Math.round(result.score ?? 0)}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{result.company}</p>
                          <p className="text-xs text-muted-foreground mb-2">"{result.feedback}"</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(result.completed_at)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No recent results to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Interviews</span>
                </CardTitle>
                <CardDescription>Your scheduled interviews this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData?.upcoming_interviews?.length > 0 ? (
                    dashboardData.upcoming_interviews.map((interview) => (
                      <div key={interview.id} className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-foreground">{interview.company}</h4>
                          <Badge variant="outline">{interview.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{interview.position}</p>
                        <p className="text-xs text-muted-foreground mb-2">with {interview.interviewer}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{formatInterviewTime(interview.time)}</span>
                          <Button size="sm" variant="outline" className="bg-transparent" asChild>
                            <Link to="/interviewee/interviews">Join Meeting</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-muted-foreground">No upcoming interviews</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Skill Progress</span>
                </CardTitle>
                <CardDescription>Your improvement across different technical areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardData?.skill_progress?.length > 0 ? (
                    dashboardData.skill_progress.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-sm text-muted-foreground">{Math.round(skill.progress)}%</span>
                        </div>
                        <Progress value={Math.round(skill.progress)} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-muted-foreground">No skill progress data available</p>
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


