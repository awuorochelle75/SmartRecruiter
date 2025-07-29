import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { useToast } from '../../components/ui/use-toast'
import RecruiterSidebar from '../../components/RecruiterSidebar'
import DashboardNavbar from '../../components/DashboardNavbar'
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Eye,
  MessageCircle,
  Mail,
  Activity,
  Target,
  PieChart,
  LineChart,
  BarChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function ResultsAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics/recruiter/summary`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <TrendingUp className="h-4 w-4 text-gray-600" />
  }

  const handleExportAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/export/recruiter/analytics`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'analytics_report.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Analytics report exported successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to export analytics report",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics report",
        variant: "destructive",
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
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }




  if (!analytics) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="text-center">
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
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
                <h1 className="text-3xl font-bold text-foreground">Results & Analytics</h1>
                <p className="text-muted-foreground">Comprehensive insights into your recruitment performance</p>
              </div>
              <Button onClick={handleExportAnalytics}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                      <p className="text-2xl font-bold">{analytics.overview.total_assessments}</p>
                      <p className="text-sm text-muted-foreground">
                        {analytics.overview.total_attempts} attempts
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                      <p className="text-2xl font-bold">{analytics.overview.average_score}%</p>
                      <p className="text-sm text-muted-foreground">
                        {analytics.overview.completion_rate}% completion rate
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                      <p className="text-2xl font-bold">{analytics.overview.total_candidates}</p>
                      <p className="text-sm text-muted-foreground">
                        {analytics.overview.total_interviews} interviews
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{analytics.overview.interview_success_rate}%</p>
                      <p className="text-sm text-muted-foreground">
                        {analytics.overview.completed_interviews} completed
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Practice Problems Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Problems</span>
                        <span className="font-medium">{analytics.overview.total_practice_problems}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Attempts</span>
                        <span className="font-medium">{analytics.overview.total_practice_attempts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Completed</span>
                        <span className="font-medium">{analytics.overview.completed_practice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Score</span>
                        <span className={`font-medium ${getScoreColor(analytics.overview.average_practice_score)}`}>
                          {analytics.overview.average_practice_score}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>



                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Communication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Messages</span>
                        <span className="font-medium">{analytics.overview.total_messages}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Unread Messages</span>
                        <span className="font-medium">{analytics.overview.unread_messages}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Response Rate</span>
                        <span className="font-medium">
                          {analytics.overview.total_messages > 0 
                            ? Math.round(((analytics.overview.total_messages - analytics.overview.unread_messages) / analytics.overview.total_messages) * 100)
                            : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {analytics.category_breakdown.length > 0 && (
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Category Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analytics.category_breakdown.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {category.total_assessments} assessments, {category.total_attempts} attempts
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getScoreColor(category.average_score)}`}>
                                  {category.average_score}%
                                </span>
                                <Progress value={category.average_score} className="w-20 h-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assessment Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Assessment Attempts Trend
                      </CardTitle>
                      <CardDescription>Last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.trends.months.map((month, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{month}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{analytics.trends.assessment_trends[index]}</span>
                              {index > 0 && getTrendIcon(
                                analytics.trends.assessment_trends[index],
                                analytics.trends.assessment_trends[index - 1]
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interview Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Interview Trends
                      </CardTitle>
                      <CardDescription>Last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.trends.months.map((month, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{month}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{analytics.trends.interview_trends[index]}</span>
                              {index > 0 && getTrendIcon(
                                analytics.trends.interview_trends[index],
                                analytics.trends.interview_trends[index - 1]
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="assessments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Performing Assessments
                    </CardTitle>
                    <CardDescription>Assessments with highest average scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.top_assessments.map((assessment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{assessment.title}</div>
                              <Badge variant={assessment.type === 'test' ? 'default' : 'secondary'}>
                                {assessment.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {assessment.completed_attempts}/{assessment.total_attempts} completed
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`font-bold text-lg ${getScoreColor(assessment.average_score)}`}>
                                {assessment.average_score}%
                              </div>
                              <div className="text-sm text-muted-foreground">Average Score</div>
                            </div>
                            <Progress value={assessment.average_score} className="w-20 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Assessments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Recent Assessments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.recent_activity.recent_assessments.map((assessment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div>
                              <div className="font-medium">{assessment.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {assessment.total_questions} questions • {formatDate(assessment.created_at)}
                              </div>
                            </div>
                            <Badge variant={assessment.is_test ? 'default' : 'secondary'}>
                              {assessment.is_test ? 'Test' : 'Regular'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Interviews */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Interviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.recent_activity.recent_interviews.map((interview, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div>
                              <div className="font-medium">{interview.position}</div>
                              <div className="text-sm text-muted-foreground">
                                {interview.type} • {formatDate(interview.scheduled_at)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(interview.status)}>
                                {interview.status}
                              </Badge>
                              {interview.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm">{interview.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
} 




