"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Play, Clock, Award, Filter, Search, BookOpen, Star } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import Footer from "../../components/Footer"
import { CardSkeleton } from "../../components/LoadingSkeleton"

// const availableTests = [
//   {
//     id: 1,
//     title: "React Developer Assessment",
//     company: "TechCorp Inc.",
//     description: "Comprehensive React assessment covering hooks, state management, and component architecture.",
//     difficulty: "Intermediate",
//     duration: 60,
//     questions: 25,
//     passingScore: 70,
//     skills: ["React", "JavaScript", "CSS", "Redux"],
//     deadline: "2024-01-30",
//     estimatedTime: "1 hour",
//     attempts: 1,
//     maxAttempts: 2,
//     status: "available",
//     rating: 4.5,
//     completions: 1250,
//   },
//   {
//     id: 2,
//     title: "JavaScript Fundamentals",
//     company: "StartupXYZ",
//     description: "Test your core JavaScript knowledge including ES6+, async programming, and DOM manipulation.",
//     difficulty: "Beginner",
//     duration: 45,
//     questions: 20,
//     passingScore: 65,
//     skills: ["JavaScript", "ES6", "DOM", "Async/Await"],
//     deadline: "2024-02-05",
//     estimatedTime: "45 minutes",
//     attempts: 0,
//     maxAttempts: 3,
//     status: "available",
//     rating: 4.2,
//     completions: 2100,
//   },
//   {
//     id: 3,
//     title: "Full Stack Challenge",
//     company: "DevSolutions",
//     description: "Complete full-stack assessment covering frontend, backend, and database design.",
//     difficulty: "Advanced",
//     duration: 120,
//     questions: 15,
//     passingScore: 75,
//     skills: ["React", "Node.js", "MongoDB", "REST APIs"],
//     deadline: "2024-02-10",
//     estimatedTime: "2 hours",
//     attempts: 0,
//     maxAttempts: 1,
//     status: "available",
//     rating: 4.8,
//     completions: 450,
//   },
//   {
//     id: 4,
//     title: "Python Data Structures",
//     company: "DataFlow Inc.",
//     description: "Advanced Python assessment focusing on data structures, algorithms, and optimization.",
//     difficulty: "Advanced",
//     duration: 90,
//     questions: 18,
//     passingScore: 80,
//     skills: ["Python", "Algorithms", "Data Structures", "Optimization"],
//     deadline: "2024-01-28",
//     estimatedTime: "1.5 hours",
//     attempts: 1,
//     maxAttempts: 2,
//     status: "completed",
//     rating: 4.6,
//     completions: 800,
//     score: 85,
//   },
//   {
//     id: 5,
//     title: "System Design Interview",
//     company: "CloudTech",
//     description: "Design scalable systems and demonstrate your architectural thinking.",
//     difficulty: "Expert",
//     duration: 150,
//     questions: 5,
//     passingScore: 70,
//     skills: ["System Design", "Scalability", "Architecture", "Databases"],
//     deadline: "2024-02-15",
//     estimatedTime: "2.5 hours",
//     attempts: 0,
//     maxAttempts: 1,
//     status: "locked",
//     rating: 4.9,
//     completions: 200,
//     requirement: "Complete 3 advanced assessments first",
//   },
// ]

export default function AvailableTests() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [tests, setTests] = useState([])
  const [attempts, setAttempts] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tests/available`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setTests(data.tests || [])
          const attemptsObj = {}
          for (const test of data.tests || []) {
            attemptsObj[test.id] = Array(test.attempts).fill({}).map((_, index) => ({
              id: index + 1,
              status: test.status === 'completed' ? 'completed' : 'in_progress',
              score: test.score
            }))
          }
          setAttempts(attemptsObj)
        } else {
          setTests([])
          setAttempts({})
        }
      } catch (err) {
        console.error("Error fetching tests:", err)
        setTests([])
        setAttempts({})
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.skills && test.skills.join(",").toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDifficulty = filterDifficulty === "all" || test.difficulty.toLowerCase() === filterDifficulty
    const matchesStatus = filterStatus === "all" || test.status === filterStatus
    return matchesSearch && matchesDifficulty && matchesStatus
  })


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }


  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "locked":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleStartTest = async (testId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/interviewee/assessments/${testId}/start`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Could not start test")
        return
      }
      const data = await res.json()
      navigate(`/interviewee/assessment/${testId}?attempt=${data.attempt_id}`)
    } catch (err) {
      alert("Could not start test")
    }
  }

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Available Tests</h1>
                <p className="text-muted-foreground">Discover and take assessments to showcase your skills</p>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available Tests</p>
                      <p className="text-2xl font-bold">
                        {tests.filter((t) => t.status === "available").length}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">
                        {tests.filter((t) => t.status === "completed").length}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          const completedTests = tests.filter(t => t.status === "completed" && t.score !== null)
                          if (completedTests.length === 0) return "0%"
                          const avgScore = Math.round(completedTests.reduce((sum, test) => sum + test.score, 0) / completedTests.length)
                          return `${avgScore}%`
                        })()}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          const totalMinutes = tests.reduce((sum, test) => sum + (test.duration || 0), 0)
                          const hours = Math.floor(totalMinutes / 60)
                          const minutes = totalMinutes % 60
                          if (hours > 0) return `${hours}h ${minutes}m`
                          return `${minutes}m`
                        })()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              <Input
                placeholder="Search tests by title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <div className="flex gap-2">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-foreground">{test.title}</h4>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground mb-2">{test.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>{test.duration} min</span>
                      <span>{test.questions} questions</span>
                      <span>Passing: {test.passingScore}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(test.skills || []).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {test.status === "available" && (
                        <Button size="sm" onClick={() => handleStartTest(test.id)}>Start Test</Button>
                      )}
                      {test.status === "completed" && (
                        <Button size="sm" variant="outline" className="bg-transparent" asChild>
                          <Link to="/interviewee/results">View Results</Link>
                        </Button>
                      )}
                      {test.status === "locked" && (
                        <Button size="sm" variant="outline" disabled className="bg-transparent">
                          Locked
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">Attempts: {test.attempts}/{test.maxAttempts}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>


            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tests found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria to find more tests.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}





