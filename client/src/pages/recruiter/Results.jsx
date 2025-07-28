"use client"

import { useState, useEffect } from "react"
import { useLocation, useParams } from "react-router-dom"
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
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { TableSkeleton } from "../../components/LoadingSkeleton"



export default function Results() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("score")
  const [results, setResults] = useState([])
  const location = useLocation()

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/assessments/${id}/results`, { credentials: "include" })
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
    if (id) fetchResults()
  }, [id])

  const filteredResults = results
    .filter((result) => {
      const matchesSearch =
        (result.candidate_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.assessment || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === "all" || result.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.score || 0) - (a.score || 0)
        case "name":
          return (a.candidate_name || "").localeCompare(b.candidate_name || "")
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




  const getStatusBadge = (status) => {
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




  if (loading) {
    return (
      <div className="w-full bg-background flex">
        <div className="fixed left-0 top-0 h-screen z-30">
        <RecruiterSidebar />
        </div>
        <div className="flex-1 flex flex-col ml-64">
          <DashboardNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <TableSkeleton />
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
          <div className="space-y-6 w-full px-2 md:px-8 lg:px-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Results</h1>
                <p className="text-muted-foreground">View and analyze assessment results and candidate performance</p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Sort by Score</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                </SelectContent>
              </Select>
            </div>





            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>Detailed results for all candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={result.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${result.avatar}` : "/placeholder.svg"} alt={result.candidate_name} />
                              <AvatarFallback>
                                {(result.candidate_name || "?").split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{result.candidate_name}</div>
                              <div className="text-sm text-muted-foreground">{result.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{result.assessment}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getScoreColor(result.score)}`}>
                              {result.status === "completed" ? `${(result.score ?? 0).toFixed(1)}%` : "-"}
                            </span>
                            {result.status === "completed" && <Progress value={result.score} className="w-16 h-2" />}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(result.status)}</TableCell>
                        <TableCell>{result.time_spent > 0 ? `${Math.floor(result.time_spent / 60)}:${(result.time_spent % 60).toString().padStart(2, '0')} min` : "-"}</TableCell>
                        <TableCell>
                          {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
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



