"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Video, MapPin, User, Mail, FileText, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Separator } from "../../components/ui/separator"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { CardSkeleton } from "../../components/LoadingSkeleton"
import { useToast } from "../../components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

export default function ScheduledInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setInterviews(data.interviews || [])
      } else {
        console.error("Failed to fetch interviews")
      }
    } catch (error) {
      console.error("Error fetching interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "technical":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "behavioral":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "system_design":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      case "coding":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (dateString) => {
    const interviewDate = new Date(dateString)
    const today = new Date()
    return interviewDate.toDateString() === today.toDateString()
  }

  const getTimeUntilInterview = (dateString) => {
    const interviewDate = new Date(dateString)
    const now = new Date()
    const diff = interviewDate - now
    
    if (diff <= 0) return "Now"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const upcomingInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduled_at)
    const today = new Date()
    return interviewDate > today && interview.status !== "cancelled"
  })

  const completedInterviews = interviews.filter(interview => interview.status === "completed")

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <IntervieweeSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scheduled Interviews</h1>
              <p className="text-muted-foreground">Manage your upcoming and completed interviews</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{completedInterviews.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{interviews.length}</p>
                    </div>
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* Upcoming Interviews */}
                  <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
                    {upcomingInterviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming interviews</h3>
                    <p className="text-muted-foreground">
                      You don't have any scheduled interviews at the moment
                    </p>
                  </CardContent>
                </Card>
                    ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingInterviews.map((interview) => (
                    <Card key={interview.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={interview.recruiter.avatar} />
                              <AvatarFallback>
                                {interview.recruiter.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{interview.position}</h4>
                              <p className="text-sm text-muted-foreground">{interview.recruiter.company}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(interview.scheduled_at)}</span>
                          <span className="text-muted-foreground">at</span>
                          <span>{formatTime(interview.scheduled_at)}</span>
                            </div>
                        <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.duration} minutes</span>
                            </div>
                        <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.location || "Video Call"}</span>
                            </div>
                        <Badge className={`${getTypeColor(interview.type)} ml-0`} variant="outline">
                          {interview.type.replace("_", " ")}
                            </Badge>
                        {isToday(interview.scheduled_at) && (
                          <div className="text-sm text-orange-600 font-medium">
                            ⏰ {getTimeUntilInterview(interview.scheduled_at)} until interview
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInterview(interview)}
                          >
                            View Details
                              </Button>
                          {interview.meeting_link && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(interview.meeting_link, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                    )}
                  </div>

            {/* Completed Interviews */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Completed Interviews</h2>
              {completedInterviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No completed interviews</h3>
                    <p className="text-muted-foreground">
                      Your completed interviews will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedInterviews.map((interview) => (
                    <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={interview.recruiter.avatar} />
                          <AvatarFallback>
                                {interview.recruiter.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>


                              <h4 className="font-medium">{interview.position}</h4>
                              <p className="text-sm text-muted-foreground">{interview.recruiter.company}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(interview.scheduled_at)}</span>
                          <span className="text-muted-foreground">at</span>
                          <span>{formatTime(interview.scheduled_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.location || "Video Call"}</span>
                        </div>
                        <Badge className={`${getTypeColor(interview.type)} ml-0`} variant="outline">
                          {interview.type.replace("_", " ")}
                        </Badge>
                        {interview.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">Rating:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${i < interview.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInterview(interview)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
                      </div>
                    </div>

          {/* Interview Details Dialog */}
          <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Interview Details</DialogTitle>
              </DialogHeader>
              {selectedInterview && (
                <div className="space-y-6">
                  {/* Interviewer Information */}
                  <div>
                    <h4 className="font-medium mb-3">Interviewer</h4>
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedInterview.recruiter.avatar} />
                        <AvatarFallback>
                          {selectedInterview.recruiter.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedInterview.recruiter.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedInterview.recruiter.company}</p>
                        <p className="text-sm text-muted-foreground">{selectedInterview.recruiter.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interview Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Position</p>
                      <p className="text-sm text-muted-foreground">{selectedInterview.position}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <Badge className={getTypeColor(selectedInterview.type)}>
                        {selectedInterview.type.replace("_", " ")}
                      </Badge>
                    </div>
                      <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedInterview.scheduled_at)} at {formatTime(selectedInterview.scheduled_at)}
                        </p>
                      </div>
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{selectedInterview.duration} minutes</p>
                    </div>
                      <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{selectedInterview.location || "Video Call"}</p>
                            </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(selectedInterview.status)}>
                        {selectedInterview.status}
                      </Badge>
                        </div>
                      </div>

                  {selectedInterview.meeting_link && (
                    <div>
                      <p className="text-sm font-medium mb-2">Meeting Link</p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedInterview.meeting_link, '_blank')}
                        className="w-full"
                      >
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                      </Button>
                    </div>
                  )}

                  {selectedInterview.notes && (
                      <div>
                      <p className="text-sm font-medium mb-2">Interview Notes</p>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">{selectedInterview.notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedInterview.feedback && (
                      <div>
                      <p className="text-sm font-medium mb-2">Feedback</p>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">{selectedInterview.feedback}</p>
                      </div>
                    </div>
                  )}

                  {selectedInterview.rating && (
                      <div>
                      <p className="text-sm font-medium mb-2">Rating</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < selectedInterview.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {selectedInterview.rating}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Preparation Tips */}
                  {selectedInterview.status === "scheduled" && (
                          <div>
                      <h4 className="font-medium mb-3">Preparation Tips</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Research the company and role thoroughly
                          </p>
                          </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Prepare questions to ask the interviewer
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Test your equipment and internet connection
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Have your resume and portfolio ready
                          </p>
                          </div>
                      </div>
                  </div>
            )}
          </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}



