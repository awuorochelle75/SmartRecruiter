"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { TableSkeleton } from "../../components/LoadingSkeleton"
import { useToast } from "../../components/ui/use-toast"
import { useNavigate } from "react-router-dom"

export default function Assessments() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "",
    duration: "",
  })
  const [assessments, setAssessments] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteAssessmentId, setDeleteAssessmentId] = useState(null)
  const [deleteCandidateCount, setDeleteCandidateCount] = useState(0)
  const [deleteAssessmentTitle, setDeleteAssessmentTitle] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}/assessments`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assessments")
        return res.json()
      })
      .then((data) => {
        setAssessments(data)
        setLoading(false)
      })
      .catch((err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      setLoading(false)
      })
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [isCreateDialogOpen])

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || assessment.status === filterStatus
    return matchesSearch && matchesFilter
  })



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

  const handleCreateAssessment = (e) => {
    e.preventDefault()
    console.log("Creating assessment:", newAssessment)
    setIsCreateDialogOpen(false)
    setNewAssessment({ title: "", description: "", type: "", duration: "" })
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assessments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to delete assessment")
      setAssessments((prev) => prev.filter((a) => a.id !== id))
      toast({ title: "Success", description: "Assessment deleted!", variant: "default" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleViewDetails = (assessmentId) => {
    navigate(`/recruiter/assessments/${assessmentId}`);
  };

  const fetchCandidateCount = async (assessmentId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/assessments/${assessmentId}/results`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch candidate count")
      const data = await res.json()
      return data.length
    } catch {
      return 0
    }
  }

  const openDeleteDialog = async (assessment) => {
    setDeleteAssessmentId(assessment.id)
    setDeleteAssessmentTitle(assessment.title)
    setShowDeleteDialog(true)
    setDeleteLoading(true)
    const count = await fetchCandidateCount(assessment.id)
    setDeleteCandidateCount(count)
    setDeleteLoading(false)
  }
  const confirmDelete = async () => {
    setDeleteLoading(true)
    await handleDelete(deleteAssessmentId)
    setShowDeleteDialog(false)
    setDeleteAssessmentId(null)
    setDeleteCandidateCount(0)
    setDeleteAssessmentTitle("")
    setDeleteLoading(false)
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
                <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
                <p className="text-muted-foreground">Create and manage your technical assessments</p>
              </div>
              <Button onClick={() => navigate("/recruiter/create-assessment")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                          {assessment.title}
                          {assessment.is_test ? (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">Test Assessment</span>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded font-medium">Regular Assessment</span>
                          )}
                        </h3>
                        <Badge className={getStatusColor(assessment.status)}>
                          {getStatusIcon(assessment.status)}
                          <span className="ml-1 capitalize">{assessment.status}</span>
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(assessment.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/recruiter/edit-assessment/${assessment.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(assessment)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{assessment.description}</CardDescription>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{assessment.candidates} candidates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{assessment.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{categories.find(c => String(c.id) === String(assessment.category_id))?.name || "Uncategorized"}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Created: {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : "-"}
                      </p>
                      <p>Deadline: {assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : "-"}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1" onClick={() => navigate(`/recruiter/assessments/${assessment.id}/results`)}>
                        View Results
                      </Button>
                      {assessment.is_test ? (
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent cursor-not-allowed opacity-60" disabled>
                          <svg className="h-4 w-4 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                          No Invites Needed
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => navigate(`/recruiter/assessments/${assessment.id}/send-invites`)}>
                        Send Invites
                      </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAssessments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No assessments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first assessment to get started"}
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <Button onClick={() => navigate("/recruiter/create-assessment")}> 
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assessment?</DialogTitle>
            <DialogDescription>
              {deleteLoading ? (
                <span>Loading candidate info...</span>
              ) : (
                <span>
                  {deleteCandidateCount > 0 ? (
                    <span>
                      <b>Warning:</b> This assessment has been taken by <b>{deleteCandidateCount}</b> candidate{deleteCandidateCount !== 1 && 's'}.<br />
                      Deleting it will also delete <b>all their submissions and results</b>.<br />
                    </span>
                  ) : (
                    <span>This assessment has not been taken by any candidates yet.</span>
                  )}
                  <br />Are you sure you want to delete <b>{deleteAssessmentTitle}</b>?
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete Assessment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


