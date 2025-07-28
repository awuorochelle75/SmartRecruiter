"use client"

import { useState, useEffect } from "react"
import { Play, Code, Trophy, Clock, Target, BookOpen, Zap } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { CardSkeleton } from "../../components/LoadingSkeleton"
import CodingProblem from "./problemTypes/CodingProblem"
import MultipleChoiceProblem from "./problemTypes/MultipleChoiceProblem"
import ShortAnswerProblem from "./problemTypes/ShortAnswerProblem"



const practiceCategories = [
  {
    id: "algorithms",
    name: "Algorithms",
    icon: Target,
    description: "Practice algorithmic problem solving",
    problems: 150,
    completed: 45,
    difficulty: "Mixed",
  },
  {
    id: "data-structures",
    name: "Data Structures",
    icon: Code,
    description: "Master arrays, trees, graphs, and more",
    problems: 120,
    completed: 38,
    difficulty: "Mixed",
  },
  {
    id: "system-design",
    name: "System Design",
    icon: BookOpen,
    description: "Learn to design scalable systems",
    problems: 50,
    completed: 12,
    difficulty: "Advanced",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: Zap,
    description: "JavaScript-specific challenges",
    problems: 200,
    completed: 78,
    difficulty: "Mixed",
  },
]

// const practiceProblems = [
//   {
//     id: 1,
//     title: "Two Sum",
//     difficulty: "Easy",
//     category: "algorithms",
//     description:
//       "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
//     timeLimit: 30,
//     points: 100,
//     completed: true,
//     bestTime: 12,
//     attempts: 3,
//     successRate: 85,
//   },
//   {
//     id: 2,
//     title: "Binary Tree Traversal",
//     difficulty: "Medium",
//     category: "data-structures",
//     description: "Implement inorder, preorder, and postorder traversal of a binary tree.",
//     timeLimit: 45,
//     points: 200,
//     completed: false,
//     bestTime: null,
//     attempts: 0,
//     successRate: 65,
//   },
//   {
//     id: 3,
//     title: "Design a URL Shortener",
//     difficulty: "Hard",
//     category: "system-design",
//     description: "Design a URL shortening service like bit.ly with high availability and scalability.",
//     timeLimit: 90,
//     points: 500,
//     completed: false,
//     bestTime: null,
//     attempts: 0,
//     successRate: 35,
//   },
//   {
//     id: 4,
//     title: "Async/Await Patterns",
//     difficulty: "Medium",
//     category: "javascript",
//     description: "Implement various async/await patterns and handle promise chains effectively.",
//     timeLimit: 40,
//     points: 250,
//     completed: true,
//     bestTime: 28,
//     attempts: 2,
//     successRate: 70,
//   },
// ]

export default function PracticeArena() {
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [currentProblem, setCurrentProblem] = useState(null)
  const [problems, setProblems] = useState([])
  const [userAttempts, setUserAttempts] = useState([])
  const [userStats, setUserStats] = useState({
    problems_solved: 0,
    success_rate: 0,
    avg_time: 0,
    streak: 0
  })

  // Restore current problem from localStorage on mount
  useEffect(() => {
    const activeId = localStorage.getItem("practice_active_problem_id")
    if (activeId && problems.length > 0) {
      const found = problems.find(p => String(p.id) === String(activeId))
      if (found) setCurrentProblem(found)
    }
  }, [problems])

  useEffect(() => {
    setLoading(true)
    // Fetch problems, user attempts, and statistics in parallel
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/public/practice-problems`),
      fetch(`${import.meta.env.VITE_API_URL}/practice-problems/attempts`, {
        credentials: "include"
      }),
      fetch(`${import.meta.env.VITE_API_URL}/practice-problems/statistics`, {
        credentials: "include"
      })
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([problemsData, attemptsData, statsData]) => {
      setProblems(problemsData)
      setUserAttempts(attemptsData)
      setUserStats(statsData)
      setLoading(false)
    })
    .catch(error => {
      console.error('Error fetching data:', error)
      setLoading(false)
    })
  }, [])

  // Helper function to get user's attempts for a specific problem
  const getUserAttemptsForProblem = (problemId) => {
    return userAttempts.filter(attempt => attempt.problem_id === problemId)
  }

  // Helper function to get remaining attempts for a problem
  const getRemainingAttempts = (problem) => {
    const attempts = getUserAttemptsForProblem(problem.id)
    const maxAttempts = problem.max_attempts || 3 // Default to 3 if not set
    return Math.max(0, maxAttempts - attempts.length)
  }

  // Helper function to check if user has attempted the problem
  const hasUserAttempted = (problemId) => {
    return getUserAttemptsForProblem(problemId).length > 0
  }

  const filteredProblems = problems.filter((problem) => {
    const matchesCategory = selectedCategory === "all" || String(problem.category_id) === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || (problem.difficulty && problem.difficulty.toLowerCase() === selectedDifficulty)
    return matchesCategory && matchesDifficulty
  })

  // When starting a problem, persist its ID
  const handleStartProblem = (problem) => {
    // Normalize problem_type for frontend
    let normalizedType = problem.problem_type
    if (normalizedType === 'multiple-choice') normalizedType = 'multiple_choice'
    if (normalizedType === 'short-answer') normalizedType = 'short_answer'
    // Set currentProblem with normalized type
    setCurrentProblem({ ...problem, problem_type: normalizedType })
    localStorage.setItem("practice_active_problem_id", problem.id)
  }

  // When closing a problem, clear the active ID
  const handleExitProblem = () => {
    setCurrentProblem(null)
    localStorage.removeItem("practice_active_problem_id")
    // Refresh attempts and statistics data to show updated progress
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/practice-problems/attempts`, {
        credentials: "include"
      }),
      fetch(`${import.meta.env.VITE_API_URL}/practice-problems/statistics`, {
        credentials: "include"
      })
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([attemptsData, statsData]) => {
      setUserAttempts(attemptsData)
      setUserStats(statsData)
    })
    .catch(error => {
      console.error('Error refreshing data:', error)
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <IntervieweeSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (currentProblem && currentProblem.problem_type === "coding") {
    return (
      <CodingProblem
        problem={currentProblem}
        onExit={handleExitProblem}
      />
    )
  }
  if (currentProblem && currentProblem.problem_type === "multiple_choice") {
    return (
      <MultipleChoiceProblem
        problem={currentProblem}
        onExit={handleExitProblem}
      />
    )
  }
  if (currentProblem && currentProblem.problem_type === "short_answer") {
    return (
      <ShortAnswerProblem
        problem={currentProblem}
        onExit={handleExitProblem}
      />
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
              <h1 className="text-3xl font-bold text-foreground">Practice Arena</h1>
              <p className="text-muted-foreground">Sharpen your coding skills with hands-on practice</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                      <p className="text-2xl font-bold">{userStats.problems_solved}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{userStats.success_rate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                      <p className="text-2xl font-bold">{userStats.avg_time}m</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Streak</p>
                      <p className="text-2xl font-bold">{userStats.streak}</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="categories" className="space-y-6">
              <TabsList>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-6">
                {/* Practice Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {practiceCategories.map((category) => {
                    const IconComponent = category.icon
                    const completionRate = Math.round((category.completed / category.problems) * 100)

                    return (
                      <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <Badge variant="outline">{category.difficulty}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <CardDescription>{category.description}</CardDescription>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {category.completed}/{category.problems}
                              </span>
                            </div>
                            <Progress value={completionRate} className="h-2" />
                          </div>

                          <Button className="w-full" onClick={() => setSelectedCategory(category.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Practice
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="problems" className="space-y-6">
                {/* Filters */}
                <div className="flex space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {problems
                        .map(p => p.category ? { id: String(p.category_id), name: p.category } : null)
                        .filter((v, i, arr) => v && arr.findIndex(x => x && x.id === v.id) === i)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Problems List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProblems.map((problem) => {
                    const hasAttempted = hasUserAttempted(problem.id)
                    const remainingAttempts = getRemainingAttempts(problem)
                    const attempts = getUserAttemptsForProblem(problem.id)
                    const bestAttempt = attempts.length > 0 ? attempts.reduce((best, current) => 
                      current.score > best.score ? current : best
                    ) : null

                    return (
                      <Card key={problem.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{problem.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                                <span className="text-sm text-muted-foreground">{problem.points} pts</span>
                                {hasAttempted && (
                                  <Badge variant="outline" className="text-xs">
                                    {bestAttempt?.passed ? "✓ Passed" : "✗ Failed"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <CardDescription className="text-sm">{problem.description}</CardDescription>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Time Limit:</span>
                              <div className="font-medium">{problem.estimated_time || "-"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Difficulty:</span>
                              <div className="font-medium">{problem.difficulty}</div>
                            </div>
                          </div>
                          
                          {/* Attempts Information */}
                          {hasAttempted && (
                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Attempts:</span>
                                <span className="font-medium">{attempts.length}/{problem.max_attempts || 3}</span>
                              </div>
                              {bestAttempt && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Best Score:</span>
                                  <span className="font-medium">{bestAttempt.score}/{bestAttempt.max_score}</span>
                                </div>
                              )}
                              {remainingAttempts > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Remaining:</span>
                                  <span className="font-medium text-blue-600">{remainingAttempts} attempts</span>
                                </div>
                              )}
                              {remainingAttempts === 0 && (
                                <div className="text-sm text-red-600 font-medium">
                                  No attempts remaining
                                </div>
                              )}
                            </div>
                          )}

                          <Button 
                            className="w-full" 
                            variant={hasAttempted ? "outline" : "default"}
                            onClick={() => handleStartProblem(problem)}
                            disabled={remainingAttempts === 0 && hasAttempted}
                          >
                            {hasAttempted ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {remainingAttempts > 0 ? "Retake Problem" : "No Attempts Left"}
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Problem
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest practice sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userAttempts.slice(0, 10).map((attempt) => {
                        // Find the problem details
                        const problem = problems.find(p => p.id === attempt.problem_id)
                        const problemTitle = problem ? problem.title : `Problem ${attempt.problem_id}`
                        
                        // Calculate time ago
                        const timestamp = new Date(attempt.timestamp)
                        const now = new Date()
                        const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60))
                        const diffInDays = Math.floor(diffInHours / 24)
                        
                        let timeAgo = ''
                        if (diffInDays > 0) {
                          timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
                        } else if (diffInHours > 0) {
                          timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
                        } else {
                          timeAgo = 'Just now'
                        }
                        
                        // Format time taken
                        const timeTaken = attempt.time_taken || 0
                        const timeTakenMinutes = Math.floor(timeTaken / 60)
                        const timeTakenSeconds = timeTaken % 60
                        const timeDisplay = timeTakenMinutes > 0 
                          ? `${timeTakenMinutes}m ${timeTakenSeconds}s`
                          : `${timeTakenSeconds}s`
                        
                        return (
                          <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  attempt.passed ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <div>
                                <h4 className="font-medium">{problemTitle}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {attempt.passed ? 'Solved' : 'Failed'} in {timeDisplay}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{attempt.points_earned} pts</div>
                              <div className="text-sm text-muted-foreground">{timeAgo}</div>
                            </div>
                          </div>
                        )
                      })}
                      {userAttempts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No practice activity yet. Start solving problems to see your progress!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}



