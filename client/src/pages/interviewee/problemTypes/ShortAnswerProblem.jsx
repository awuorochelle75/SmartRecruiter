import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Badge } from "../../../components/ui/badge"
import { X, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import { useToast } from "../../../components/ui/use-toast"

function Spinner({ className }) {
  return (
    <svg className={className || "animate-spin h-4 w-4 mr-2 text-primary"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  )
}

export default function ShortAnswerProblem({ problem, onExit }) {
  const storageKey = `practice_sa_${problem.id}`
  const [answer, setAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempt, setAttempt] = useState(1)
  const [hintsOpen, setHintsOpen] = useState(true)
  const [studyOpen, setStudyOpen] = useState(true)
  const [resourcesOpen, setResourcesOpen] = useState(true)
  const { toast } = useToast()

  // Restore state from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null")
    if (saved) {
      setAnswer(saved.answer)
      setSubmitted(saved.submitted)
      setIsCorrect(saved.isCorrect)
      setAttempt(saved.attempt || 1)
    }
  }, [problem])

  // Persist state
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ answer, submitted, isCorrect, attempt }))
  }, [answer, submitted, isCorrect, attempt])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    
    setLoading(true)
    const startTime = Date.now() / 1000
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/practice-problems/${problem.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          answer: answer.trim(),
          start_time: startTime
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
        setIsCorrect(data.passed)
        setAttempt(data.attempt_number)
        
        toast({
          title: data.passed ? 'Correct!' : 'Incorrect',
          description: data.passed 
            ? `You earned ${data.points_earned} points!` 
            : 'Keep trying!',
          variant: data.passed ? 'default' : 'destructive',
        })
        
        setTimeout(() => {
          onExit()
        }, 1500)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit answer',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit answer. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExit = () => {
    setShowExitDialog(false)
    localStorage.removeItem(storageKey)
    onExit()
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-0 overflow-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl bg-card rounded-lg shadow p-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{problem.title}</h1>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">{problem.points} pts</span>
                      {problem.tags && problem.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">{problem.tags.map(t => `#${t}`).join(' ')}</span>
                      )}
                      <span className="text-xs text-muted-foreground">Attempt: {attempt}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExitDialog(true)}
                    className="ml-2 p-1 rounded hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Exit"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="mb-4 text-base text-muted-foreground whitespace-pre-line">{problem.description}</div>

                {problem.hints && problem.hints.length > 0 && (
                  <div className="mt-4">
                    <button
                      className="w-full flex items-center justify-between font-semibold mb-2 focus:outline-none hover:bg-muted/30 rounded px-2 py-1 transition"
                      onClick={() => setHintsOpen(o => !o)}
                      aria-expanded={hintsOpen}
                      aria-controls="hints-panel"
                    >
                      <span>Hints</span>
                      {hintsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {hintsOpen && (
                      <div id="hints-panel" className="bg-muted/40 rounded-lg shadow-sm p-3">
                        <ul className="space-y-2 list-disc list-inside">
                          {problem.hints.map((hint, i) => (
                            <li key={i} className="text-xs leading-relaxed">{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                

                {problem.study_sections && problem.study_sections.length > 0 && (
                  <div className="mt-4">
                    <button
                      className="w-full flex items-center justify-between font-semibold mb-2 focus:outline-none hover:bg-muted/30 rounded px-2 py-1 transition"
                      onClick={() => setStudyOpen(o => !o)}
                      aria-expanded={studyOpen}
                      aria-controls="study-panel"
                    >
                      <span>Study Sections</span>
                      {studyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {studyOpen && (
                      <div id="study-panel" className="space-y-4">
                        {problem.study_sections.map((section, i) => (
                          <div key={i} className="bg-muted/30 rounded-lg shadow-sm p-3">
                            <div className="font-medium mb-1 text-base">{section.title}</div>
                            <div className="text-xs whitespace-pre-line leading-relaxed">{section.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                


                {problem.learning_resources && problem.learning_resources.length > 0 && (
                  <div className="mt-4">
                    <button
                      className="w-full flex items-center justify-between font-semibold mb-2 focus:outline-none hover:bg-muted/30 rounded px-2 py-1 transition"
                      onClick={() => setResourcesOpen(o => !o)}
                      aria-expanded={resourcesOpen}
                      aria-controls="resources-panel"
                    >
                      <span>Learning Resources</span>
                      {resourcesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {resourcesOpen && (
                      <div id="resources-panel" className="bg-muted/40 rounded-lg shadow-sm p-3">
                        <ul className="space-y-2">
                          {problem.learning_resources.map((res, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <a
                                href={res.url || res}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline text-xs hover:text-primary/80 flex items-center gap-1"
                                aria-label="Opens in a new tab"
                                title="Opens in a new tab"
                              >
                                {res.title || res.url || res}
                                <ExternalLink className="inline h-3 w-3 ml-1 text-muted-foreground" aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              
              <div className="flex flex-col justify-center">
                <form onSubmit={e => { e.preventDefault(); setShowSubmitDialog(true) }}>
                  <Textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="mb-4 mt-6"
                    rows={3}
                    disabled={submitted}
                  />
                  {!submitted && (
                    <Button type="submit" className="w-full" disabled={!answer.trim() || loading}>
                      {loading && <Spinner />}Submit
                    </Button>
                  )}
                  {submitted && isCorrect === true && (
                    <div className="mt-4 text-center font-semibold text-green-600">Correct!</div>
                  )}

                  {submitted && isCorrect === false && (
                    <div className="mt-4 text-center font-semibold text-red-600">Incorrect. Try again!</div>
                  )}
                  {submitted && isCorrect === null && (
                    <div className="mt-4 text-center font-semibold text-blue-600">Answer submitted.</div>
                  )}
                </form>
              </div>
            </div>
            

            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Answer</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to submit your answer? You won't be able to change it after submitting.</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => { setShowSubmitDialog(false); handleSubmit(); }}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exit Problem</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to exit? Your answer and progress will be lost.</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExitDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleExit}>Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
} 


