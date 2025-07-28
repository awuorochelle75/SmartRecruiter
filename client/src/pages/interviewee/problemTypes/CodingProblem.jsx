import { useState, useEffect, useRef } from "react"
import MonacoEditor from "@monaco-editor/react"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { X, RotateCcw, ExternalLink, ChevronDown, ChevronRight } from "lucide-react"
import { useToast } from "../../../components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs"
import { CheckCircle, XCircle } from "lucide-react"




function useResizablePanels(defaults) {
  const [sizes, setSizes] = useState(defaults)
  const dragging = useRef(null)

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return
      // e.preventDefault()
      // e.stopPropagation()
      // if (e.touches && e.touches.length > 1) return // Ignore multi-touch events

      const { panel, startX, startSizes } = dragging.current
      const dx = (e.touches ? e.touches[0].clientX : e.clientX) - startX
      const totalWidth = window.innerWidth
      const minProblem = 180, maxProblem = 600
      const minEditor = 250, maxEditor = Math.max(600, totalWidth - minProblem * 2)
      const minTerminal = 180, maxTerminal = 600
      if (panel === 0) {
        let newLeft = Math.max(minProblem, Math.min(maxProblem, startSizes[0] + dx))
        let newCenter = Math.max(minEditor, Math.min(maxEditor, startSizes[1] - dx))
        
        if (newLeft + newCenter + startSizes[2] > totalWidth) {
          newCenter = totalWidth - newLeft - startSizes[2]
        }
        setSizes([newLeft, newCenter, startSizes[2]])
      } else if (panel === 1) {
        let newCenter = Math.max(minEditor, Math.min(maxEditor, startSizes[1] + dx))
        let newRight = Math.max(minTerminal, Math.min(maxTerminal, startSizes[2] - dx))
        
        if (startSizes[0] + newCenter + newRight > totalWidth) {
          newCenter = totalWidth - startSizes[0] - newRight
        }
        setSizes([startSizes[0], newCenter, newRight])
      }
    }
    function onUp() { dragging.current = null }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onMove)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchend", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchend", onUp)
    }
  }, [])
  function startDrag(panel, e) {
    dragging.current = {
      panel,
      startX: e.touches ? e.touches[0].clientX : e.clientX,
      startSizes: [...sizes],
    }
    e.preventDefault()
  }
  return [sizes, startDrag]
}


function Spinner({ className }) {
  return (
    <svg className={className || "animate-spin h-4 w-4 mr-2 text-primary"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  )
}

export default function CodingProblem({ problem, onExit }) {
  const [code, setCode] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [userInput, setUserInput] = useState("")
  const [runOutput, setRunOutput] = useState("")
  const [testResults, setTestResults] = useState([])
  const [timeoutError, setTimeoutError] = useState("")
  const [codeRunning, setCodeRunning] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [inputError, setInputError] = useState("")
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)
  const storageKey = `practice_coding_${problem.id}`

  // Panel open/close state
  const [hintsOpen, setHintsOpen] = useState(true)
  const [studyOpen, setStudyOpen] = useState(true)
  const [resourcesOpen, setResourcesOpen] = useState(true)

  
  const [panelSizes, startPanelDrag] = useResizablePanels([400, 600, 360])

  
  const [lastAction, setLastAction] = useState(null)

  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null")
    let lang = (problem.allowed_languages && problem.allowed_languages.length) ? problem.allowed_languages[0] : "javascript"
    if (saved) {
      setCode(saved.code || problem.starter_code || "")
      setSelectedLanguage(saved.selectedLanguage || lang)
      setTimeLeft(saved.timeLeft || (problem.time_limit || 30) * 60)
    } else {
      setCode(problem.starter_code || "function reverseString(str) {\n  return str.split('').reverse().join('');\n}\n\n// Call the function with input\nconsole.log(reverseString(readline()));")
      setSelectedLanguage(lang)
      setTimeLeft((problem.time_limit || 30) * 60)
    }
  }, [problem])

  

  useEffect(() => {
    if (timeLeft !== null && code !== undefined && selectedLanguage) {
      localStorage.setItem(storageKey, JSON.stringify({ code, timeLeft, selectedLanguage }))
    }
  }, [code, timeLeft, selectedLanguage])

  
  useEffect(() => {
    if (!timeLeft) return
    if (timeLeft <= 0) {
      setShowSubmitDialog(true)
      return
    }
    timerRef.current = setTimeout(() => {
      setTimeLeft(t => t - 1)
    }, 1000)
    return () => clearTimeout(timerRef.current)
  }, [timeLeft])

  const handleRun = async () => {
    setInputError("")
    setTimeoutError("")
    if (!userInput.trim()) {
      setInputError("Please provide input for your code.")
      return
    }
    setCodeRunning(true)
    setRunOutput("")
    setTestResults([])
    setLastAction('run')
    let inputToSend = userInput
    if (selectedLanguage === 'python') {
      const funcMatch = code.match(/def\s+\w+\(([^)]*)\)/)
      if (funcMatch) {
        const args = funcMatch[1].split(',').map(a => a.trim()).filter(Boolean)
        if (args.length === 1 && !/^['\"]/.test(userInput.trim()) && !/["']$/.test(userInput.trim())) {
          inputToSend = `"${userInput.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
        }
      }
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          language: selectedLanguage.toLowerCase(),
          input: inputToSend,
        }),
      })
      const data = await res.json()
      if (data.compile_error || data.error) {
        setRunOutput(
          <>
            <span className="text-red-500 font-semibold">{data.error ? "Error" : "Compile Error"}</span>
            {data.code && (
              <>
                {"\n[Compiled Code]\n"}
                <span className="text-xs text-muted-foreground font-mono">{data.code}</span>
                {"\n"}
              </>
            )}
            {data.error && (
              <span className="text-xs font-mono text-red-600">{"\n" + data.error}</span>
            )}
          </>
        )
        setCodeRunning(false)
        return
      }
      if (data.timeout) {
        setTimeoutError(data.output || "Error: Code execution timed out (possible infinite loop)")
        setRunOutput("")
      } else {
        setRunOutput(data.output || "No output.")
      }
    } catch (err) {
      setTimeoutError("Error running code.")
      setRunOutput("")
    }
    setCodeRunning(false)
  }

  const handleRunTestCases = async () => {
    setTimeoutError("")
    setCodeRunning(true)
    setTestResults([])
    setLastAction('testcases')
    let testCases = (problem.visible_test_cases || []).map(tc => ({ ...tc, expectedOutput: tc.expectedOutput }))
    if (selectedLanguage === 'python') {
      const funcMatch = code.match(/def\s+\w+\(([^)]*)\)/)
      if (funcMatch) {
        const args = funcMatch[1].split(',').map(a => a.trim()).filter(Boolean)
        if (args.length === 1) {
          testCases = testCases.map(tc => {
            const input = tc.input.trim()
            if (!/^['\"]/.test(input) && !/["']$/.test(input)) {
              return { ...tc, input: `"${input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` }
            }
            return tc
          })
        }
      }
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          language: selectedLanguage.toLowerCase(),
          test_cases: testCases,
        }),
      })
      const data = await res.json()
      if (data.timeout) {
        setTimeoutError(data.output || "Error: Code execution timed out (possible infinite loop)")
        setTestResults([])
      } else if (data.test_case_results && data.test_case_results.length > 0) {
        setTestResults(data.test_case_results)
      } else {
        setTestResults([])
        setTimeoutError("No output.")
      }
    } catch (err) {
      setTimeoutError("Error running code.")
      setTestResults([])
    }
    setCodeRunning(false)
  }

  const handleResetCode = () => {
    setCode(problem.starter_code || "")
    setShowResetDialog(false)
  }

  const handleClearLogs = () => {
    setRunOutput("")
    setTestResults([])
    setTimeoutError("")
  }

  const { toast } = useToast()

  const handleSubmit = async () => {
    setShowSubmitDialog(false)
    setCodeRunning(true)
    const startTime = Date.now() / 1000
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/practice-problems/${problem.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code_submission: code,
          language: selectedLanguage.toLowerCase(),
          start_time: startTime,
        }),
      })
      const data = await res.json()
      setCodeRunning(false)
      if (data.passed) {
        toast({
          title: 'Submission Successful',
          description: `You passed! Score: ${data.score}/${data.max_score}. Points: ${data.points_earned}`,
          variant: 'success',
        })
      } else {
        toast({
          title: 'Submission Saved',
          description: `You did not pass. Score: ${data.score}/${data.max_score}.`,
          variant: 'destructive',
        })
      }
      setTimeout(() => {
        localStorage.removeItem(storageKey)
        setCode("")
        setRunOutput("")
        setTestResults([])
        setTimeoutError("")
        setUserInput("")
        setInputError("")
        setTimeLeft((problem.time_limit || 30) * 60)
        onExit()
      }, 1200)
    } catch (err) {
      setCodeRunning(false)
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your solution.',
        variant: 'destructive',
      })
    }
  }

  const handleExit = () => {
    setShowExitDialog(false)
    localStorage.removeItem(storageKey)
    onExit()
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

  const safeLanguage = (selectedLanguage || (problem.allowed_languages && problem.allowed_languages[0]) || "javascript")

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const flexDirection = isMobile ? "flex-col" : "flex-row";
  const panelStyle = isMobile ? { width: "100%", minWidth: 0, minHeight: 120, maxHeight: "40vh" } : undefined;
  const problemPanelStyle = isMobile ? panelStyle : { width: panelSizes[0], minWidth: 180, maxWidth: 600 };
  const editorPanelStyle = isMobile ? panelStyle : { width: panelSizes[1], minWidth: 250 };
  const terminalPanelStyle = isMobile ? panelStyle : { width: panelSizes[2], minWidth: 180 };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-0 overflow-hidden">
          <div className={`flex h-full w-full overflow-hidden transition-all duration-300 ${flexDirection}`} style={{ minHeight: 0 }}>
            <section
              className="flex flex-col transition-all duration-200 bg-card border-r border-border overflow-auto min-h-[120px]"
              style={isMobile ? { ...panelStyle, borderRight: 0, borderBottom: "1px solid var(--border)" } : problemPanelStyle}
            >



              <div className="p-6 pb-2 border-b border-border flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{problem.title}</h1>
                  <div className="flex items-center space-x-4 mb-2">
                    <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                    <span className="text-sm text-muted-foreground">{problem.points} points</span>
                    <div className="flex items-center space-x-1">
                      {typeof timeLeft === "number" && (
                        <>
                          <span className="text-sm">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                        </>
                      )}
                    </div>
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
              <div className="p-6 flex-1 min-h-0 overflow-auto">
                <div className="text-sm mb-4 whitespace-pre-line">{problem.description}</div>
                {problem.examples && problem.examples.length > 0 && (
                  <div className="mt-4">
                    <div className="font-semibold mb-2">Examples:</div>
                    <div className="space-y-2">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="bg-muted/50 rounded p-2 text-xs font-mono">
                          <div><span className="font-semibold">Input:</span> {ex.input}</div>
                          <div><span className="font-semibold">Output:</span> {ex.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                

                {problem.hints && problem.hints.length > 0 && (
                  <div className="mt-6">
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
                  <div className="mt-6">
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
                  <div className="mt-6">
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
            </section>
            

            {!isMobile && (
              <div
                onMouseDown={e => startPanelDrag(0, e)}
                onTouchStart={e => startPanelDrag(0, e)}
                className="w-2 cursor-col-resize bg-border hover:bg-primary/20 transition"
                style={{ zIndex: 10, minHeight: 120 }}
                aria-label="Resize problem panel"
                role="separator"
                tabIndex={0}
              />
            )}
            
            <section
              className="flex flex-col flex-1 transition-all duration-200 bg-background border-r border-border overflow-hidden min-h-[120px]"
              style={editorPanelStyle}
            >
              <div className="p-4 border-b border-border flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <Label>Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {(problem.allowed_languages || ["javascript"]).map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="ml-auto p-1 rounded hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Reset code"
                  title="Reset code to starter code"
                >
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <MonacoEditor
                  height="100%"
                  width="100%"
                  language={safeLanguage.toLowerCase()}
                  value={code}
                  onChange={v => setCode(v || "")}
                  theme={document.documentElement.classList.contains('dark') ? "vs-dark" : "light"}
                  options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                />
              </div>
            </section>
            {!isMobile && (
              <div
                onMouseDown={e => startPanelDrag(1, e)}
                onTouchStart={e => startPanelDrag(1, e)}
                className="w-2 cursor-col-resize bg-border hover:bg-primary/20 transition"
                style={{ zIndex: 10, minHeight: 120 }}
                aria-label="Resize terminal panel"
                role="separator"
                tabIndex={0}
              />
            )}
            <section
              className="flex flex-col transition-all duration-200 bg-card overflow-hidden flex-shrink-0 min-h-[120px]"
              style={terminalPanelStyle}
            >
              <div className="p-4 border-b border-border flex gap-2 items-center">
                <Button onClick={handleRun} variant="outline" disabled={codeRunning}>
                  {codeRunning && <Spinner />}
                  Run Code
                </Button>
                <Button onClick={handleRunTestCases} variant="outline" disabled={codeRunning}>
                  {codeRunning && <Spinner />}
                  Run Test Cases
                </Button>
                <Button onClick={() => setShowSubmitDialog(true)} disabled={codeRunning} className="bg-primary text-white">
                  {codeRunning && <Spinner />}
                  Submit
                </Button>
              </div>


              <div className="p-4 flex flex-col gap-2 border-b border-border">
                <Textarea
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onFocus={() => {
                    if (!userInput && problem.visible_test_cases && problem.visible_test_cases.length > 0) {
                      setUserInput(problem.visible_test_cases[0].input || "")
                    }
                  }}
                  className="font-mono text-xs resize-none py-1 px-2 h-7 min-h-0 max-h-8"
                  placeholder={
                    problem.visible_test_cases && problem.visible_test_cases.length > 0
                      ? `e.g. ${problem.visible_test_cases[0].input}`
                      : "Enter input for your code..."
                  }
                  rows={1}
                />
                {inputError && <div className="text-red-600 text-xs">{inputError}</div>}
              </div>
              <div className="flex-1 min-h-0 overflow-auto bg-black/80 text-white rounded-b p-2 text-xs font-mono relative" style={{ minHeight: 80, maxHeight: 300 }}>
                <button
                  onClick={handleClearLogs}
                  className="absolute top-2 right-2 text-xs text-muted-foreground hover:underline hover:text-primary focus:outline-none bg-transparent px-1 py-0.5 rounded"
                  aria-label="Clear logs"
                  title="Clear logs"
                >
                  Clear
                </button>
                {timeoutError && <div className="bg-red-50 text-red-800 p-2 rounded text-sm font-mono">{timeoutError}</div>}
                {lastAction === 'run' && runOutput && <div>{runOutput}</div>}
                {lastAction === 'testcases' && !timeoutError && (
                  <div className="text-muted-foreground italic">Test case results are shown below.</div>
                )}
                {lastAction === 'run' && !timeoutError && !runOutput && <div className="text-muted-foreground">No output.</div>}
              </div>
              {problem.visible_test_cases && problem.visible_test_cases.length > 0 && (
                <div className="p-4 border-t border-border bg-muted/30">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    Test Cases
                    {codeRunning && <Spinner className="h-4 w-4 text-primary" />}
                  </div>
                  

                  {testResults.length > 0 ? (
                    <Tabs defaultValue="0" className="w-full">
                      <TabsList className="flex gap-2 mb-2 overflow-x-auto">
                        {problem.visible_test_cases.map((tc, idx) => (
                          <TabsTrigger key={idx} value={String(idx)} className="px-3 py-1 text-xs">
                            Case {idx + 1}
                            {testResults[idx]?.passed ? (
                              <CheckCircle className="inline h-4 w-4 ml-1 text-green-600" />
                            ) : (
                              <XCircle className="inline h-4 w-4 ml-1 text-red-600" />
                            )}
                          </TabsTrigger>
                        ))}
                      </TabsList>


                      {problem.visible_test_cases.map((tc, idx) => {
                        const result = testResults[idx] || {}
                        return (
                          <TabsContent key={idx} value={String(idx)} className="bg-card rounded-lg p-4 border">
                            <div className="mb-2 text-xs text-muted-foreground">Input</div>
                            <div className="font-mono text-xs bg-muted/40 rounded px-2 py-1 mb-2">{tc.input}</div>
                            <div className="mb-2 text-xs text-muted-foreground">Output</div>
                            <div className={`font-mono text-xs rounded px-2 py-1 mb-2 bg-muted/50 max-h-24 overflow-auto whitespace-pre-wrap ${result.passed ? "text-green-800 dark:text-green-200" : result.runtime_error ? "text-red-700 dark:text-red-300" : "text-red-700 dark:text-red-300"}`}>{result.runtime_error ? <span className="font-semibold">Runtime Error</span> : (result.output ?? '-')}</div>
                            <div className="mb-2 text-xs text-muted-foreground">Expected</div>
                            <div className="font-mono text-xs bg-muted/40 rounded px-2 py-1 mb-2">{tc.expectedOutput ?? tc.expected}</div>
                            <div className="flex items-center gap-2 mt-2">
                              {result.passed ? (
                                <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Pass</span>
                              ) : result.runtime_error ? (
                                <span className="text-red-600 font-semibold flex items-center gap-1"><XCircle className="h-4 w-4" /> Runtime Error</span>
                              ) : (
                                <span className="text-red-600 font-semibold flex items-center gap-1"><XCircle className="h-4 w-4" /> Fail</span>
                              )}
                            </div>
                          </TabsContent>
                        )
                      })}
                    </Tabs>

                  // ) : testResults.length === 0 && !codeRunning ? (
                  //   <div className="text-muted-foreground">Run the code or test cases to see results.</div>
                  ) : (
                    <div className="space-y-3">
                      {problem.visible_test_cases.map((tc, idx) => (
                        <div key={idx} className="rounded-lg p-3 border flex flex-col md:flex-row md:items-center gap-2 border-border bg-card">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Input</div>
                            <div className="font-mono text-xs bg-muted/40 rounded px-2 py-1 mb-1">{tc.input}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Expected</div>
                            <div className="font-mono text-xs bg-muted/40 rounded px-2 py-1 mb-1">{tc.expectedOutput ?? tc.expected}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Output</div>
                            <div className="font-mono text-xs rounded px-2 py-1 mb-1 bg-muted/40">-</div>
                          </div>
                          <div className="flex items-center min-w-[60px] justify-center">
                            <span className="text-muted-foreground font-medium">Not run</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.hidden_test_cases && problem.hidden_test_cases.length > 0 && (
                    <div className="mt-3 text-xs text-muted-foreground italic">
                      +{problem.hidden_test_cases.length} hidden test case{problem.hidden_test_cases.length > 1 ? "s" : ""} not shown
                      {testResults.length > 0 && (
                        <div className="mt-1">
                          <span className="text-green-600">✓ {testResults.filter(r => r.passed).length} passed</span>
                          <span className="text-red-600 ml-2">✗ {testResults.filter(r => !r.passed).length} failed</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Code</DialogTitle>
              </DialogHeader>
              <div>Are you sure you want to reset your code to the original starter code? This will erase all your current changes.</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleResetCode}>Reset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Solution</DialogTitle>
              </DialogHeader>
              <div>Are you sure you want to submit your solution? You won't be able to change your answer after submitting.</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleSubmit}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exit Problem</DialogTitle>
              </DialogHeader>
              <div>Are you sure you want to exit? Your code and timer will be lost.</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExitDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleExit}>Exit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
} 

