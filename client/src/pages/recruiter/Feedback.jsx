"use client"

import { useState, useEffect } from "react"
import { 
  MessageSquare, 
  Lightbulb, 
  Bug, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  Eye,
  Edit
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { useToast } from "../../components/ui/use-toast"

const feedbackTypeIcons = {
  general: MessageSquare,
  suggestion: Lightbulb,
  bug_report: Bug
}

const statusColors = {
  pending: "bg-yellow-500",
  reviewed: "bg-blue-500", 
  resolved: "bg-green-500"
}

const priorityColors = {
  low: "bg-gray-500",
  medium: "bg-yellow-500",
  high: "bg-red-500"
}

export default function Feedback() {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: "",
    priority: "",
    admin_notes: ""
  })

  useEffect(() => {
    fetchFeedback()
    fetchStats()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
        credentials: "include",
      })
      const data = await response.json()
      if (response.ok) {
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }




  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/stats`, {
        credentials: "include",
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }




  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/${selectedFeedback.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateForm)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feedback updated successfully",
          variant: "default"
        })
        fetchFeedback()
        setIsUpdateDialogOpen(false)
        setSelectedFeedback(null)
        setUpdateForm({ status: "", priority: "", admin_notes: "" })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update feedback",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    }
  }

  const openUpdateDialog = (feedback) => {
    setSelectedFeedback(feedback)
    setUpdateForm({
      status: feedback.status,
      priority: feedback.priority,
      admin_notes: feedback.admin_notes || ""
    })
    setIsUpdateDialogOpen(true)
  }

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interviewee_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesType = typeFilter === "all" || item.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="text-center">Loading feedback...</div>
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
                <h1 className="text-3xl font-bold text-foreground">Feedback Management</h1>
                <p className="text-muted-foreground">Review and manage user feedback</p>
              </div>
            </div>




            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Feedback</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.total_feedback}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.pending_feedback}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Resolved</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.resolved_feedback}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">This Week</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.recent_feedback}</div>
                  </CardContent>
                </Card>
              </div>
            )}




            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search feedback..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== "all" || typeFilter !== "all" 
                        ? "Try adjusting your filters or search terms."
                        : "No feedback has been submitted yet."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeedback.map((item) => {
                  const TypeIcon = feedbackTypeIcons[item.type]
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <TypeIcon className="h-5 w-5 text-muted-foreground" />
                                <Badge variant="outline" className="capitalize">
                                  {item.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <Badge 
                                className={`${statusColors[item.status]} text-white capitalize`}
                              >
                                {item.status}
                              </Badge>
                              <Badge 
                                className={`${priorityColors[item.priority]} text-white capitalize`}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">{item.subject}</h3>
                              <p className="text-muted-foreground mt-1 line-clamp-2">
                                {item.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center space-x-4">
                                <span>By: {item.interviewee_name}</span>
                                <span>{item.interviewee_email}</span>
                              </div>
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Feedback Details</DialogTitle>
                                  <DialogDescription>
                                    Submitted by {item.interviewee_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Subject</Label>
                                    <p className="font-medium">{item.subject}</p>
                                  </div>
                                  <div>
                                    <Label>Message</Label>
                                    <p className="whitespace-pre-wrap">{item.message}</p>
                                  </div>
                                  {item.admin_notes && (
                                    <div>
                                      <Label>Admin Notes</Label>
                                      <p className="whitespace-pre-wrap">{item.admin_notes}</p>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Status</Label>
                                      <Badge className={`${statusColors[item.status]} text-white capitalize`}>
                                        {item.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <Label>Priority</Label>
                                      <Badge className={`${priorityColors[item.priority]} text-white capitalize`}>
                                        {item.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openUpdateDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>



      {/* Update Feedback Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Feedback</DialogTitle>
            <DialogDescription>
              Update the status and add admin notes for this feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={updateForm.priority} onValueChange={(value) => setUpdateForm({...updateForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={updateForm.admin_notes}
                onChange={(e) => setUpdateForm({...updateForm, admin_notes: e.target.value})}
                placeholder="Add notes about this feedback..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFeedback}>
                Update Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



