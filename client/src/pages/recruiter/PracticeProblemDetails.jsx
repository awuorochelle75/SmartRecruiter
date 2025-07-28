import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Separator } from "../../components/ui/separator"
import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { ArrowLeft, Edit, Clock, Target, Code, FileText, Tag, Users, TrendingUp } from "lucide-react"



export default function PracticeProblemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [stats, setStats] = useState({
    total_attempts: 0,
    success_rate: 0,
    avg_time: 0,
    unique_users: 0
  })

  useEffect(() => {
    fetchProblemDetails()
  }, [id])

  async function fetchProblemDetails() {
    try {
      const [problemRes, attemptsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/practice-problems/${id}`, { credentials: "include" }),
        fetch(`${import.meta.env.VITE_API_URL}/practice-problems/${id}/attempts`, { credentials: "include" })
      ])

      if (problemRes.ok && attemptsRes.ok) {
        const problemData = await problemRes.json()
        const attemptsData = await attemptsRes.json()
        
        setProblem(problemData)
        setAttempts(attemptsData)
        
        const totalAttempts = attemptsData.length
        const successfulAttempts = attemptsData.filter(a => a.passed).length
        const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0
        const avgTime = totalAttempts > 0 ? Math.round(attemptsData.reduce((sum, a) => sum + (a.time_taken || 0), 0) / totalAttempts / 60) : 0
        const uniqueUsers = new Set(attemptsData.map(a => a.user_id)).size

        setStats({
          total_attempts: totalAttempts,
          success_rate: successRate,
          avg_time: avgTime,
          unique_users: uniqueUsers
        })
      } else {
        toast({ title: "Error", description: "Failed to load problem details", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching problem details:', error)
      toast({ title: "Error", description: "Failed to load problem details", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }
  


  function getDifficultyColor(difficulty) {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  function formatTime(seconds) {
    if (!seconds) return "0s"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  
  function safeJsonParse(jsonString, defaultValue = []) {
    if (!jsonString) {
      return defaultValue
    }
    
    
    if (Array.isArray(jsonString) || typeof jsonString === 'object') {
      return jsonString
    }
    
    try {
      const result = JSON.parse(jsonString)
      return result
    } catch (error) {
      console.warn('safeJsonParse: Failed to parse JSON:', jsonString, error)
      return defaultValue
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="h-64 bg-muted animate-pulse rounded"></div>
              <div className="h-32 bg-muted animate-pulse rounded"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }



  if (!problem) {
    return (
      <div className="flex h-screen bg-background">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Problem Not Found</h2>
              <p className="text-muted-foreground mb-4">The practice problem you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/recruiter/practice-problems")}>
                Back to Practice Problems
              </Button>
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
          

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/recruiter/practice-problems")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <p className="text-muted-foreground">Practice Problem Details</p>
              </div>
            </div>
            <Button onClick={() => navigate(`/recruiter/practice-problems/edit/${problem.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Problem
            </Button>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                    <p className="text-2xl font-bold">{stats.total_attempts}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{stats.success_rate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                    <p className="text-2xl font-bold">{stats.avg_time}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{stats.unique_users}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>



          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="attempts">Attempts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problem Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Problem Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      <p className="text-base">{problem.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-base whitespace-pre-line">{problem.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                        <div className="mt-1">
                          <Badge className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Points</label>
                        <p className="text-base">{problem.points} pts</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <p className="text-base capitalize">{problem.problem_type?.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="text-base">{problem.category || "Uncategorized"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {problem.tags?.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-base">{formatDate(problem.created_at)}</p>
                    </div>
                  </CardContent>
                </Card>



                <Card>
                  <CardHeader>
                    <CardTitle>Problem Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Time Limit</label>
                      <p className="text-base">{problem.estimated_time || "No limit"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Max Attempts</label>
                      <p className="text-base">{problem.max_attempts || "Unlimited"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Visibility</label>
                      <p className="text-base">{problem.is_public ? "Public" : "Private"}</p>
                    </div>
                    {problem.problem_type === 'coding' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Allowed Languages</label>
                          <p className="text-base">{problem.allowed_languages || "All languages"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Memory Limit</label>
                          <p className="text-base">{problem.memory_limit ? `${problem.memory_limit} MB` : "No limit"}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>



            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                


                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Problem Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {problem.problem_type === 'coding' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Starter Code</label>
                          <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                            {problem.starter_code || "No starter code provided"}
                          </pre>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Solution</label>
                          <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                            {problem.solution || "No solution provided"}
                          </pre>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Test Cases</label>
                          <div className="mt-2 space-y-2">
                            {problem.visible_test_cases && safeJsonParse(problem.visible_test_cases).length > 0 && (
                              <div>
                                <p className="text-sm font-medium">Visible Test Cases</p>
                                <div className="p-2 bg-muted rounded-md text-xs space-y-1">
                                  {safeJsonParse(problem.visible_test_cases).map((testCase, index) => (
                                    <div key={index} className="border-b border-border pb-1 last:border-b-0">
                                      <div className="font-medium">Test Case {index + 1}:</div>
                                      <div>Input: <code className="bg-background px-1 rounded">{testCase.input}</code></div>
                                      <div>Expected: <code className="bg-background px-1 rounded">{testCase.expectedOutput}</code></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}



                            {problem.hidden_test_cases && safeJsonParse(problem.hidden_test_cases).length > 0 && (
                              <div>
                                <p className="text-sm font-medium">Hidden Test Cases</p>
                                <div className="p-2 bg-muted rounded-md text-xs space-y-1">
                                  {safeJsonParse(problem.hidden_test_cases).map((testCase, index) => (
                                    <div key={index} className="border-b border-border pb-1 last:border-b-0">
                                      <div className="font-medium">Test Case {index + 1}:</div>
                                      <div>Input: <code className="bg-background px-1 rounded">{testCase.input}</code></div>
                                      <div>Expected: <code className="bg-background px-1 rounded">{testCase.expectedOutput}</code></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(!problem.visible_test_cases || safeJsonParse(problem.visible_test_cases).length === 0) && 
                             (!problem.hidden_test_cases || safeJsonParse(problem.hidden_test_cases).length === 0) && (
                              <p className="text-sm text-muted-foreground">No test cases defined</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    {problem.problem_type === 'multiple-choice' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Options</label>
                          <div className="mt-2 space-y-2">
                            {problem.options && safeJsonParse(problem.options).length > 0 ? (
                              safeJsonParse(problem.options).map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                                  <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                                  <span className="text-sm">{option}</span>
                                  {index === problem.correct_answer && (
                                    <Badge variant="outline" className="text-xs">Correct</Badge>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No options defined</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Explanation</label>
                          <p className="text-sm mt-2">{problem.explanation || "No explanation provided"}</p>
                        </div>
                      </>
                    )}
                    {problem.problem_type === 'short-answer' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Accepted Answers</label>
                          <div className="mt-2 space-y-1">
                            {problem.answer_template && (
                              <pre className="p-2 bg-muted rounded-md text-sm">
                                {problem.answer_template}
                              </pre>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                          <p className="text-sm mt-2">{problem.keywords || "No keywords specified"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Max Character Limit</label>
                          <p className="text-sm mt-2">{problem.max_char_limit || "No limit"}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>


                <Card>
                  <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {problem.hints && safeJsonParse(problem.hints).length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Hints</label>
                        <div className="mt-2 space-y-2">
                          {safeJsonParse(problem.hints).map((hint, index) => (
                            <div key={index} className="p-2 bg-muted rounded-md text-sm">
                              {hint}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {problem.learning_resources && safeJsonParse(problem.learning_resources).length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Learning Resources</label>
                        <div className="mt-2 space-y-2">
                          {safeJsonParse(problem.learning_resources).map((resource, index) => (
                            <div key={index} className="p-2 bg-muted rounded-md text-sm">
                              {typeof resource === 'string' ? resource : resource.title || resource.url}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {problem.study_sections && safeJsonParse(problem.study_sections).length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Study Sections</label>
                        <div className="mt-2 space-y-2">
                          {safeJsonParse(problem.study_sections).map((section, index) => (
                            <div key={index} className="p-2 bg-muted rounded-md">
                              <p className="font-medium text-sm">{section.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!problem.hints || safeJsonParse(problem.hints).length === 0) && 
                     (!problem.learning_resources || safeJsonParse(problem.learning_resources).length === 0) && 
                     (!problem.study_sections || safeJsonParse(problem.study_sections).length === 0) && (
                      <div className="text-center py-4 text-muted-foreground">
                        No learning resources available for this problem.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attempts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  {attempts.length > 0 ? (
                    <div className="space-y-4">
                      {attempts.map((attempt) => (
                        <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                attempt.passed ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <div>
                              <h4 className="font-medium">{attempt.user_email || `User #${attempt.user_id}`}</h4>
                              <p className="text-sm text-muted-foreground">
                                {attempt.passed ? 'Solved' : 'Failed'} • Attempt #{attempt.attempt_number}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{attempt.score}/{attempt.max_score}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(attempt.time_taken)} • {formatDate(attempt.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No attempts yet for this problem.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
} 


