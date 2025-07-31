"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock, CheckCircle, XCircle, Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { useToast } from "../../components/ui/use-toast"
import CodingProblem from "./problemTypes/CodingProblem"
import MultipleChoiceProblem from "./problemTypes/MultipleChoiceProblem"
import ShortAnswerProblem from "./problemTypes/ShortAnswerProblem"

export default function CategorySession({ sessionData, onExit }) {
  const { toast } = useToast()
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [sessionProgress, setSessionProgress] = useState({
    problems_completed: 0,
    total_problems: sessionData.total_problems,
    total_score: 0,
    max_score: sessionData.max_score,
    time_spent: 0,
    status: 'in_progress'
  })
  const [timeRemaining, setTimeRemaining] = useState(sessionData.time_limit)
  const [isPaused, setIsPaused] = useState(false)
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [problemAttempts, setProblemAttempts] = useState({})
  const [existingAttempts, setExistingAttempts] = useState({})
  const [currentProblem, setCurrentProblem] = useState(null)

  // Fetch existing practice problem attempts
  useEffect(() => {
    const fetchExistingAttempts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/practice-problems/attempts`, {
          credentials: 'include'
        })
        if (response.ok) {
          const attempts = await response.json()
          // Group attempts by problem_id and count them
          const attemptsMap = {}
          attempts.forEach(attempt => {
            if (!attemptsMap[attempt.problem_id]) {
              attemptsMap[attempt.problem_id] = []
            }
            attemptsMap[attempt.problem_id].push(attempt)
          })
          setExistingAttempts(attemptsMap)
        }
      } catch (error) {
        console.error('Error fetching existing attempts:', error)
      }
    }
    
    fetchExistingAttempts()
  }, [])

  // Calculate completed problems count (count attempted problems, not just passed)
  const completedProblemsCount = Object.keys({...problemAttempts, ...existingAttempts}).length

  // Get attempt count for a problem
  const getAttemptCount = (problemId) => {
    // Count attempts from category session
    const categoryAttempts = Object.values(problemAttempts).filter(attempt => attempt.problem_id === problemId).length
    
    // Count attempts from regular practice problems (stored by problem_id as key)
    const regularAttempts = existingAttempts[problemId] ? existingAttempts[problemId].length : 0
    
    return categoryAttempts + regularAttempts
  }

  // Check if problem can be retaken
  const canRetakeProblem = (problem) => {
    const attemptCount = getAttemptCount(problem.id)
    return attemptCount < problem.max_attempts
  }

  // Check if problem is completed (has been attempted)
  const isProblemCompleted = (problemId) => {
    return problemAttempts[problemId] || (existingAttempts[problemId] && existingAttempts[problemId].length > 0)
  }

  // Check if problem is passed
  const isProblemPassed = (problemId) => {
    const categoryAttempt = problemAttempts[problemId]
    const regularAttempts = existingAttempts[problemId] || []
    const passedRegularAttempt = regularAttempts.find(attempt => attempt.passed)
    
    return (categoryAttempt && categoryAttempt.passed) || passedRegularAttempt
  }

  // Timer effect
  useEffect(() => {
    // Stop timer if all problems are completed
    if (completedProblemsCount >= sessionData.total_problems) {
      return
    }

    if (timeRemaining <= 0) {
      setShowTimeoutDialog(true)
      return
    }

    if (isPaused) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setShowTimeoutDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isPaused, completedProblemsCount, sessionData.total_problems])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle problem submission
  const handleProblemSubmit = async (problemId, answerData, timeTaken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/practice-categories/sessions/${sessionData.session_id}/submit-problem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          problem_id: problemId,
          answer: answerData,
          time_taken: timeTaken
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update session progress
        setSessionProgress(result.session_progress)
        
        // Record the attempt
        setProblemAttempts(prev => ({
          ...prev,
          [problemId]: result
        }))

        // Show success message
        toast({
          title: result.passed ? 'Correct!' : 'Incorrect',
          description: result.passed 
            ? `You earned ${result.score} points!` 
            : 'Keep trying!',
          variant: result.passed ? 'default' : 'destructive',
        })

        // Clear current problem to go back to selection view
        setCurrentProblem(null)
        
        // Move to next problem or complete session
        if (result.session_progress.problems_completed >= sessionData.total_problems) {
          // Session completed
          setSessionProgress(prev => ({ ...prev, status: 'completed' }))
        } else {
          // Move to next problem
          setCurrentProblemIndex(prev => prev + 1)
        }
      } else {
        const errorData = await response.json()
        if (response.status === 400 && errorData.error === 'Problem already attempted in this session') {
          // Problem already attempted, just clear the current problem
          setCurrentProblem(null)
        } else {
          console.error('Error submitting problem:', errorData)
        }
      }
    } catch (error) {
      console.error('Error submitting problem:', error)
    }
  }

  // Handle problem exit (for individual problem components)
  const handleProblemExit = () => {
    // This would be called when user exits a problem without submitting
    // For now, we'll just move to the next problem
    setCurrentProblemIndex(prev => prev + 1)
  }

  // Start a problem
  const startProblem = (problem) => {
    // Check if problem is completed and can't be retaken
    if (isProblemCompleted(problem.id) && !canRetakeProblem(problem)) {
      const status = isProblemPassed(problem.id) ? 'completed' : 'failed'
      toast({
        title: `Problem Already ${status === 'completed' ? 'Completed' : 'Failed'}`,
        description: `This problem has already been attempted and cannot be retaken.`,
        variant: 'default',
      })
      return
    }
    setCurrentProblem(problem)
  }

  // Pause/Resume session
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Exit session
  const handleExitSession = () => {
    if (sessionProgress.problems_completed < sessionData.total_problems) {
      setShowExitDialog(true)
    } else {
      onExit()
    }
  }

  // If session is completed, show results
  if (sessionProgress.status === 'completed') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Session Completed!</h1>
            <p className="text-muted-foreground">Great job completing the {sessionData.title}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Session Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{sessionProgress.problems_completed}/{sessionData.total_problems}</div>
                  <div className="text-sm text-muted-foreground">Problems Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{sessionProgress.total_score}/{sessionProgress.max_score}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{formatTime(sessionData.time_limit - timeRemaining)}</div>
                  <div className="text-sm text-muted-foreground">Time Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button onClick={onExit} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice Arena
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If there's a current problem, show it
  if (currentProblem) {
    const problemProps = {
      problem: currentProblem,
      onExit: handleProblemExit,
      onSubmit: (answerData, timeTaken) => handleProblemSubmit(currentProblem.id, answerData, timeTaken),
      isCategorySession: true
    }

    if (currentProblem.problem_type === "coding") {
      return <CodingProblem {...problemProps} />
    } else if (currentProblem.problem_type === "multiple-choice" || currentProblem.problem_type === "multiple_choice") {
      return <MultipleChoiceProblem {...problemProps} />
    } else if (currentProblem.problem_type === "short-answer" || currentProblem.problem_type === "short_answer") {
      return <ShortAnswerProblem {...problemProps} />
    } else {
      console.error('Unknown problem type:', currentProblem.problem_type)
      return <div>Unknown problem type: {currentProblem.problem_type}</div>
    }
  }

  // Show problem selection interface
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{sessionData.title}</h1>
            <p className="text-muted-foreground">{sessionData.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={togglePause} variant="outline">
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button onClick={handleExitSession} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Session
            </Button>
          </div>
        </div>

        {/* Timer and Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Clock className="h-6 w-6 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{formatTime(timeRemaining)}</div>
                  <div className="text-sm text-muted-foreground">Time Remaining</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {completedProblemsCount}/{sessionData.total_problems}
                </div>
                <div className="text-sm text-muted-foreground">Problems Completed</div>
              </div>
            </div>
            <Progress 
              value={(completedProblemsCount / sessionData.total_problems) * 100} 
              className="mt-4" 
            />
            
            {/* Progress Status */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              {sessionData.problems.map((problem, index) => {
                const isCompleted = isProblemCompleted(problem.id)
                const isAvailable = index === 0 || (index > 0 && isProblemCompleted(sessionData.problems[index - 1].id))
                
                return (
                  <div key={problem.id} className="flex items-center space-x-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isAvailable 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    {index < sessionData.problems.length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessionData.problems.map((problem, index) => {
            const isCompleted = isProblemCompleted(problem.id)
            const isCurrent = index === currentProblemIndex
            // A problem is available if it's the first one OR if the previous problem is completed
            const isAvailable = index === 0 || (index > 0 && isProblemCompleted(sessionData.problems[index - 1].id))
            const attemptCount = getAttemptCount(problem.id)
            const canRetake = canRetakeProblem(problem)

            return (
              <Card 
                key={problem.id} 
                className={`transition-all duration-200 ${
                  isCurrent ? 'ring-2 ring-primary' : ''
                } ${isCompleted ? 'bg-green-50 dark:bg-green-950' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Problem {index + 1}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={
                          problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }>
                          {problem.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{problem.points} pts</span>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center space-x-1">
                        {isProblemPassed(problem.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm line-clamp-2">
                    {problem.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{problem.problem_type.replace('_', ' ').replace('-', ' ')}</span>
                  </div>

                  {isCompleted && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">
                          {(() => {
                            // Check category session attempts first
                            const categoryAttempt = problemAttempts[problem.id]
                            if (categoryAttempt) {
                              return `${categoryAttempt.score}/${categoryAttempt.max_score}`
                            }
                            
                            // Check regular practice problem attempts
                            const regularAttempts = existingAttempts[problem.id] || []
                            if (regularAttempts.length > 0) {
                              // Get the best score from regular attempts
                              const bestAttempt = regularAttempts.reduce((best, attempt) => {
                                return attempt.score > best.score ? attempt : best
                              }, regularAttempts[0])
                              return `${bestAttempt.score}/${bestAttempt.max_score}`
                            }
                            
                            return "0/0"
                          })()}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => startProblem(problem)}
                    disabled={!isAvailable || (isCompleted && !canRetake)}
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {isCompleted ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {canRetake ? `Retake Problem (${attemptCount}/${problem.max_attempts})` : 
                         isProblemPassed(problem.id) ? 'Review Problem' : 'No Attempts Left'}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {isCurrent ? 'Start Problem' : 'Locked'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to exit? Your progress will be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowExitDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={onExit} variant="destructive">
              Exit Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeout Dialog */}
      <Dialog open={showTimeoutDialog} onOpenChange={setShowTimeoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time's Up!</DialogTitle>
            <DialogDescription>
              The session time limit has been reached. Your progress has been saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowTimeoutDialog(false)} variant="outline">
              Continue
            </Button>
            <Button onClick={onExit}>
              Exit Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 