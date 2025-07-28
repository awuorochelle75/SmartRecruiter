"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Mail, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Download, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Github, 
  Linkedin, 
  ExternalLink,
  Clock,
  Award,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { TableSkeleton } from "../../components/LoadingSkeleton"
import { useToast } from "../../components/ui/use-toast"

export default function Candidates() {
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showCandidateDialog, setShowCandidateDialog] = useState(false)
  const [availableCandidates, setAvailableCandidates] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    fetchCandidates()
    fetchAvailableCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/candidates`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.candidates)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch candidates",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch candidates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  const fetchAvailableCandidates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/available-candidates`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableCandidates(data.candidates)
      }
    } catch (error) {
      console.error("Error fetching available candidates:", error)
    }
  }



  const handleMessageCandidate = async (candidateId) => {
    try {
      const candidate = availableCandidates.find(c => c.id === candidateId)
      if (!candidate) {
        toast({
          title: "Error",
          description: "Candidate not found",
          variant: "destructive",
        })
        return
      }

      // Navigate to messages page with this candidate
      window.location.href = `/recruiter/messages?candidate=${candidateId}`
    } catch (error) {
      console.error("Error messaging candidate:", error)
      toast({
        title: "Error",
        description: "Failed to open message",
        variant: "destructive",
      })
    }
  }

  const filteredCandidates = (candidates || []).filter((candidate) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      (candidate.full_name?.toLowerCase() || '').includes(searchLower) ||
      (candidate.email?.toLowerCase() || '').includes(searchLower) ||
      (candidate.position?.toLowerCase() || '').includes(searchLower) ||
      (candidate.skills || []).some(skill => (skill?.toLowerCase() || '').includes(searchLower))
    const matchesFilter = filterStatus === "all" || candidate.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "interviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in-review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "applied":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }



  const getStatusIcon = (status) => {
    switch (status) {
      case "shortlisted":
        return <CheckCircle className="h-4 w-4" />
      case "interviewed":
        return <Users className="h-4 w-4" />
      case "in-review":
        return <AlertCircle className="h-4 w-4" />
      case "applied":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const getOverallScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
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



  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === "shortlisted").length,
    interviewed: candidates.filter(c => c.status === "interviewed").length,
    inReview: candidates.filter(c => c.status === "in-review").length,
    averageScore: Math.round(candidates.reduce((sum, c) => sum + Math.round(c.overall_score), 0) / candidates.length) || 0
  }

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
                <p className="text-muted-foreground">Manage and evaluate your candidate pipeline</p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Candidates
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>



              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                      <p className="text-2xl font-bold">{stats.shortlisted}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interviewed</p>
                      <p className="text-2xl font-bold">{stats.interviewed}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                      <p className="text-2xl font-bold">{stats.averageScore}%</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name, email, position, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Candidate List</CardTitle>
                <CardDescription>Detailed view of all candidates in your pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position & Skills</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Interviews</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={candidate.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${candidate.avatar}` : "/placeholder.svg"} 
                                alt={candidate.full_name} 
                              />
                              <AvatarFallback>
                                {candidate.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{candidate.full_name}</div>
                              <div className="text-sm text-muted-foreground">{candidate.email}</div>
                              {candidate.location && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {candidate.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{candidate.position || 'Not specified'}</div>
                            <div className="text-sm text-muted-foreground">
                              {candidate.position && candidate.position.includes('Senior') ? '5+ years' : 
                               candidate.position && candidate.position.includes('Junior') ? '1-3 years' : 
                               '3-5 years'} experience
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(candidate.skills || []).slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {(skill || '').trim()}
                                </Badge>
                              ))}
                              {(candidate.skills || []).length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{(candidate.skills || []).length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{candidate.assessments.completed}</span>
                              <span className="text-muted-foreground">/{candidate.assessments.total}</span>
                              <span className="text-muted-foreground"> regular</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{candidate.test_assessments.completed}</span>
                              <span className="text-muted-foreground">/{candidate.test_assessments.total}</span>
                              <span className="text-muted-foreground"> test</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{candidate.practice_problems.completed}</span>
                              <span className="text-muted-foreground"> practice</span>
                            </div>
                          </div>
                        </TableCell>



                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{candidate.interviews.total}</span>
                              <span className="text-muted-foreground"> total</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{candidate.interviews.completed}</span>
                              <span className="text-muted-foreground"> completed</span>
                            </div>
                            {candidate.interviews.scheduled > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">{candidate.interviews.scheduled}</span>
                                <span className="text-muted-foreground"> scheduled</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getOverallScoreColor(candidate.overall_score)}`}>
                              {Math.round(candidate.overall_score)}%
                            </span>
                            <Progress value={candidate.overall_score} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(candidate.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(candidate.status)}
                              {candidate.status.replace("-", " ")}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(candidate.last_activity)}</div>
                            <div className="text-muted-foreground">{formatTimeAgo(candidate.last_activity)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedCandidate(candidate)
                                    setShowCandidateDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMessageCandidate(candidate.id)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>




          {/* Candidate Detail Dialog */}
          <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Candidate Profile</DialogTitle>
                <DialogDescription>
                  Detailed information about {selectedCandidate?.full_name}
                </DialogDescription>
              </DialogHeader>
              {selectedCandidate && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={selectedCandidate.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${selectedCandidate.avatar}` : "/placeholder.svg"}
                        alt={selectedCandidate.full_name}
                      />
                      <AvatarFallback className="text-lg">
                        {selectedCandidate.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{selectedCandidate.full_name}</h3>
                      <p className="text-muted-foreground">{selectedCandidate.position || 'Not specified'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {selectedCandidate.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {selectedCandidate.location}
                          </div>
                        )}
                        {selectedCandidate.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedCandidate.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedCandidate.email}
                        </div>
                      </div>
                    </div>


                    <div className="text-right">
                      <Badge className={getStatusColor(selectedCandidate.status)}>
                        {getStatusIcon(selectedCandidate.status)}
                        {selectedCandidate.status.replace("-", " ")}
                      </Badge>
                      <div className="mt-2">
                        <span className={`text-2xl font-bold ${getOverallScoreColor(selectedCandidate.overall_score)}`}>
                          {Math.round(selectedCandidate.overall_score)}%
                        </span>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="assessments">Assessments</TabsTrigger>
                      <TabsTrigger value="interviews">Interviews</TabsTrigger>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              Skills
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {(selectedCandidate.skills || []).map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {(skill || '').trim()}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5" />
                              Statistics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Regular Assessments</span>
                              <span className="font-medium">
                                {selectedCandidate.assessments.completed}/{selectedCandidate.assessments.total}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Test Assessments</span>
                              <span className="font-medium">
                                {selectedCandidate.test_assessments.completed}/{selectedCandidate.test_assessments.total}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Practice Problems</span>
                              <span className="font-medium">
                                {selectedCandidate.practice_problems.completed}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Interviews</span>
                              <span className="font-medium">
                                {selectedCandidate.interviews.completed}/{selectedCandidate.interviews.total}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Contact & Links */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Globe className="h-5 w-5" />
                              Contact & Links
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedCandidate.linkedin_url && (
                              <div className="flex items-center justify-between">
                                <span>LinkedIn</span>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={selectedCandidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            )}
                            {selectedCandidate.github_url && (
                              <div className="flex items-center justify-between">
                                <span>GitHub</span>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={selectedCandidate.github_url} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            )}

                            {/* {selectedCandidate.website_url && (
                              <div className="flex items-center justify-between">
                                <span>Website</span>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={selectedCandidate.website_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                                  <a href={selectedCandidate.website_url} target="_blank" rel="noopener noreferrer"> */}
                            {selectedCandidate.portfolio_url && (
                              <div className="flex items-center justify-between">
                                <span>Portfolio</span>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={selectedCandidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Bio */}
                        {selectedCandidate.bio && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Bio
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{selectedCandidate.bio}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="assessments" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Card>
                          <CardHeader>
                            <CardTitle>Regular Assessments</CardTitle>
                            <CardDescription>
                              Average Score: {Math.round(selectedCandidate.assessments.average_score)}%
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedCandidate.assessments.details.map((assessment, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                                  <div>
                                    <div className="font-medium">{assessment.assessment_title}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {assessment.completed_at ? formatDate(assessment.completed_at) : 'Not completed'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={assessment.status === "completed" ? "default" : "secondary"}>
                                      {assessment.status}
                                    </Badge>
                                    {assessment.status === "completed" && (
                                      <span className="font-medium">{Math.round(assessment.score)}%</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>



                        <Card>
                          <CardHeader>
                            <CardTitle>Test Assessments</CardTitle>
                            <CardDescription>
                              Average Score: {Math.round(selectedCandidate.test_assessments.average_score)}%
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedCandidate.test_assessments.details.map((assessment, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                                  <div>
                                    <div className="font-medium">{assessment.assessment_title}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {assessment.completed_at ? formatDate(assessment.completed_at) : 'Not completed'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={assessment.status === "completed" ? "default" : "secondary"}>
                                      {assessment.status}
                                    </Badge>
                                    {assessment.status === "completed" && (
                                      <span className="font-medium">{Math.round(assessment.score)}%</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>



                    <TabsContent value="interviews" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Interview History</CardTitle>
                          <CardDescription>
                            {selectedCandidate.interviews.total} total interviews
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedCandidate.interviews.details.map((interview, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                                <div>
                                  <div className="font-medium">{interview.position}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {interview.type} • {formatDate(interview.scheduled_at)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={interview.status === "completed" ? "default" : "secondary"}>
                                    {interview.status}
                                  </Badge>
                                  {interview.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="font-medium">{interview.rating}/5</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    

                    <TabsContent value="profile" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Full Name</label>
                              <p className="text-sm text-muted-foreground">{selectedCandidate.full_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <p className="text-sm text-muted-foreground">{selectedCandidate.email}</p>
                            </div>
                            {selectedCandidate.phone && (
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p className="text-sm text-muted-foreground">{selectedCandidate.phone}</p>
                              </div>
                            )}
                            {selectedCandidate.location && (
                              <div>
                                <label className="text-sm font-medium">Location</label>
                                <p className="text-sm text-muted-foreground">{selectedCandidate.location}</p>
                              </div>
                            )}
                                                         <div>
                               <label className="text-sm font-medium">Experience</label>
                               <p className="text-sm text-muted-foreground">
                                 {selectedCandidate.position && selectedCandidate.position.includes('Senior') ? '5+ years' : 
                                  selectedCandidate.position && selectedCandidate.position.includes('Junior') ? '1-3 years' : 
                                  '3-5 years'}
                               </p>
                             </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Platform Activity</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Joined Platform</label>
                              <p className="text-sm text-muted-foreground">{formatDate(selectedCandidate.created_at)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Last Activity</label>
                              <p className="text-sm text-muted-foreground">{formatDate(selectedCandidate.last_activity)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Current Status</label>
                              <Badge className={getStatusColor(selectedCandidate.status)}>
                                {selectedCandidate.status.replace("-", " ")}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}



