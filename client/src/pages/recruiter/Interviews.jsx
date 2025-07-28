"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Video, Plus, Edit, Trash2, Users, MapPin, Loader2, MoreHorizontal, Eye } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { CardSkeleton } from "../../components/LoadingSkeleton"
import { useToast } from "../../components/ui/use-toast"

export default function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState("")
  const [deleteInterviewId, setDeleteInterviewId] = useState(null)
  const [deleteInterviewTitle, setDeleteInterviewTitle] = useState("")
  const { toast } = useToast()



  const [scheduleForm, setScheduleForm] = useState({
    interviewee_id: "",
    position: "",
    type: "technical",
    duration: 60,
    meeting_link: "",
    location: "",
    notes: "",
    assessment_id: null
  })

  
  const [editForm, setEditForm] = useState({
    position: "",
    type: "technical",
    duration: 60,
    meeting_link: "",
    location: "",
    notes: "",
    assessment_id: null
  })

  useEffect(() => {
    fetchInterviews()
    fetchCandidates()
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

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/candidates`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.candidates || [])
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    setScheduling(true)
    
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString()
      
      const requestBody = {
        ...scheduleForm,
        scheduled_at: scheduledAt
      }
      
      if (!requestBody.assessment_id || requestBody.assessment_id === "") {
        delete requestBody.assessment_id
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "Interview Scheduled",
          description: "Interview has been scheduled successfully",
        })
        setShowScheduleDialog(false)
        fetchInterviews()
        resetScheduleForm()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to schedule interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling interview:", error)
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive",
      })
    } finally {
      setScheduling(false)
    }
  }



  const resetScheduleForm = () => {
    setScheduleForm({
      interviewee_id: "",
      position: "",
      type: "technical",
      duration: 60,
      meeting_link: "",
      location: "",
      notes: "",
      assessment_id: null
    })
    setSelectedDate("")
    setSelectedTime("")
  }

  const handleUpdateInterview = async (interviewId, updates) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${interviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast({
          title: "Interview Updated",
          description: "Interview has been updated successfully",
        })
        fetchInterviews()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating interview:", error)
      toast({
        title: "Error",
        description: "Failed to update interview",
        variant: "destructive",
      })
    }
  }


  // const handleConfirmInterview = async (interviewId) => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${interviewId}/confirm`, {
  //       method: "POST",
  //       credentials: "include",
  //     })
  //     if (response.ok) {
  //       toast({
  //         title: "Interview Confirmed",
  //         description: "Interview has been confirmed successfully",
  //       })
  //       fetchInterviews()
  //     } else {

  const handleCancelInterview = async (interviewId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${interviewId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Interview Cancelled",
          description: "Interview has been cancelled successfully",
        })
        fetchInterviews()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to cancel interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling interview:", error)
      toast({
        title: "Error",
        description: "Failed to cancel interview",
        variant: "destructive",
      })
    }
  }

  const handleEditInterview = async (e) => {
    e.preventDefault()
    setEditing(true)
    
    try {
      const scheduledAt = new Date(`${editDate}T${editTime}`).toISOString()
      
      const requestBody = {
        ...editForm,
        scheduled_at: scheduledAt
      }
      
      if (!requestBody.assessment_id || requestBody.assessment_id === "") {
        delete requestBody.assessment_id
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${selectedInterview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "Interview Updated",
          description: "Interview has been updated successfully",
        })
        setShowEditDialog(false)
        fetchInterviews()
        setEditForm({
          position: "",
          type: "technical",
          duration: 60,
          meeting_link: "",
          location: "",
          notes: "",
          assessment_id: null
        })
        setEditDate("")
        setEditTime("")
        setSelectedInterview(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating interview:", error)
      toast({
        title: "Error",
        description: "Failed to update interview",
        variant: "destructive",
      })
    } finally {
      setEditing(false)
    }
  }

  const openEditDialog = (interview) => {
    setSelectedInterview(interview)
    setEditForm({
      position: interview.position,
      type: interview.type,
      duration: interview.duration,
      meeting_link: interview.meeting_link || "",
      location: interview.location || "",
      notes: interview.notes || "",
      assessment_id: interview.assessment_id || null
    })
    setEditDate(new Date(interview.scheduled_at).toISOString().split('T')[0])
    setEditTime(new Date(interview.scheduled_at).toTimeString().slice(0, 5))
    setShowEditDialog(true)
  }

  const openDeleteDialog = (interview) => {
    setDeleteInterviewId(interview.id)
    setDeleteInterviewTitle(`${interview.interviewee.name} - ${interview.position}`)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${deleteInterviewId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Interview Deleted",
          description: "Interview has been deleted successfully",
        })
        fetchInterviews()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting interview:", error)
      toast({
        title: "Error",
        description: "Failed to delete interview",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeleteInterviewId(null)
      setDeleteInterviewTitle("")
      setDeleting(false)
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

  const todayInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduled_at)
    const today = new Date()
    return interviewDate.toDateString() === today.toDateString()
  })

  const upcomingInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduled_at)
    const today = new Date()
    return interviewDate > today && interview.status !== "cancelled"
  })

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
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
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
                <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
              </div>
                            <Button onClick={() => {
                resetScheduleForm()
                setShowScheduleDialog(true)
              }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                    Schedule Interview
                  </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Interviews</p>
                      <p className="text-2xl font-bold">{todayInterviews.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{interviews.filter((i) => i.status === "completed").length}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
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
                    <Video className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>




            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Interviews</h2>
                          </div>

              {interviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No interviews scheduled</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule your first interview to get started
                    </p>
                    <Button onClick={() => setShowScheduleDialog(true)}>
                      Schedule Interview
                              </Button>
                </CardContent>
              </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {interviews.map((interview) => (
                    <Card key={interview.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={interview.interviewee.avatar} />
                              <AvatarFallback>
                                {interview.interviewee.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{interview.interviewee.name}</h4>
                              <p className="text-sm text-muted-foreground">{interview.interviewee.position}</p>
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
                                                <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInterview(interview)}
                            >
                              View Details
                            </Button>
                            {interview.status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateInterview(interview.id, { status: "confirmed" })}
                              >
                                Confirm
                              </Button>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedInterview(interview)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(interview)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(interview)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Interview
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Schedule Interview Dialog */}
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogDescription>
                  Schedule a new interview with a candidate
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleScheduleInterview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="candidate">Candidate</Label>
                    <Select
                      value={scheduleForm.interviewee_id}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, interviewee_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id.toString()}>
                            {candidate.first_name} {candidate.last_name} - {candidate.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={scheduleForm.position}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, position: e.target.value })}
                      placeholder="e.g., Senior React Developer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Interview Type</Label>
                    <Select
                      value={scheduleForm.type}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="system_design">System Design</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    placeholder="e.g., Conference Room A or Video Call"
                  />
                </div>
                <div>
                  <Label htmlFor="meeting_link">Meeting Link (optional)</Label>
                  <Input
                    id="meeting_link"
                    value={scheduleForm.meeting_link}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    placeholder="Interview notes and preparation details..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={scheduling}>
                    {scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule Interview
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

                    {/* Interview Details Dialog */}
          <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Interview Details</DialogTitle>
              </DialogHeader>
              {selectedInterview && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedInterview.interviewee.avatar} />
                            <AvatarFallback>
                        {selectedInterview.interviewee.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                      <h3 className="font-medium">{selectedInterview.interviewee.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedInterview.interviewee.position}</p>
                          </div>
                        </div>
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
                      <p className="text-sm font-medium">Meeting Link</p>
                      <a
                        href={selectedInterview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedInterview.meeting_link}
                      </a>
                        </div>
                      )}
                  {selectedInterview.notes && (
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground">{selectedInterview.notes}</p>
                    </div>
                  )}
                  {selectedInterview.feedback && (
                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <p className="text-sm text-muted-foreground">{selectedInterview.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Interview Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Interview</DialogTitle>
                <DialogDescription>
                  Update interview details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditInterview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-position">Position</Label>
                    <Input
                      id="edit-position"
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      placeholder="e.g., Senior React Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Interview Type</Label>
                    <Select
                      value={editForm.type}
                      onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="system_design">System Design</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-time">Time</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g., Conference Room A or Video Call"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-meeting-link">Meeting Link (optional)</Label>
                  <Input
                    id="edit-meeting-link"
                    value={editForm.meeting_link}
                    onChange={(e) => setEditForm({ ...editForm, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Interview notes and preparation details..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editing}>
                    {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Interview
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Interview Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Interview?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the interview for <b>{deleteInterviewTitle}</b>?
                  <br />
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {deleting ? "Deleting..." : "Delete Interview"}
                </Button>
          </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}




