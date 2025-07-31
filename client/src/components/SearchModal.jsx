"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, FileText, Users, Code, Calendar, Award, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "./ui/use-toast"

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const userRole = user?.role

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      } else {
        setResults({})
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const endpoint = userRole === 'recruiter' ? '/search/recruiter' : '/search/interviewee'
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        toast({
          title: "Search Error",
          description: "Failed to perform search. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (url) => {
    navigate(url)
    onClose()
    setQuery("")
    setResults({})
  }

  const getIconForType = (type) => {
    switch (type) {
      case 'assessment':
        return <FileText className="h-4 w-4" />
      case 'candidate':
        return <Users className="h-4 w-4" />
      case 'practice_problem':
        return <Code className="h-4 w-4" />
      case 'interview':
        return <Calendar className="h-4 w-4" />
      case 'category':
        return <Award className="h-4 w-4" />
      case 'result':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const renderAssessmentResult = (item) => (
    <div
      key={`assessment-${item.id}`}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => handleResultClick(item.url)}
    >
      <div className="flex-shrink-0">
        <FileText className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
          {item.difficulty && (
            <Badge variant="secondary" className="text-xs">
              {item.difficulty}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center space-x-2 mt-1">
          {item.category && (
            <span className="text-xs text-muted-foreground">{item.category}</span>
          )}
          {item.status && (
            <Badge className={`text-xs ${getStatusColor(item.status)}`}>
              {item.status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )

  const renderCandidateResult = (item) => (
    <div
      key={`candidate-${item.id}`}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => handleResultClick(item.url)}
    >
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={item.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${item.avatar}` : "/placeholder.svg"}
            alt={item.name}
          />
          <AvatarFallback>{item.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">{item.name}</p>
          {item.score !== null && (
            <Badge variant={item.score >= 70 ? "default" : "secondary"} className="text-xs">
              {item.score}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.email}</p>
        <div className="flex items-center space-x-2 mt-1">
          {item.position && (
            <span className="text-xs text-muted-foreground">{item.position}</span>
          )}
          {item.company && (
            <span className="text-xs text-muted-foreground">at {item.company}</span>
          )}
        </div>
      </div>
    </div>
  )

  const renderPracticeProblemResult = (item) => (
    <div
      key={`practice-${item.id}`}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => handleResultClick(item.url)}
    >
      <div className="flex-shrink-0">
        <Code className="h-5 w-5 text-purple-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <Badge variant="outline" className="text-xs">
            {item.problem_type}
          </Badge>
          {item.difficulty && (
            <Badge variant="secondary" className="text-xs">
              {item.difficulty}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center space-x-2 mt-1">
          {item.category && (
            <span className="text-xs text-muted-foreground">{item.category}</span>
          )}
          {item.estimated_time && (
            <span className="text-xs text-muted-foreground">{item.estimated_time}</span>
          )}
        </div>
      </div>
    </div>
  )

  const renderInterviewResult = (item) => (
    <div
      key={`interview-${item.id}`}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => handleResultClick(item.url)}
    >
      <div className="flex-shrink-0">
        <Calendar className="h-5 w-5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">{item.position}</p>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
          {getStatusIcon(item.status)}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {userRole === 'recruiter' ? item.interviewee_name : item.recruiter_name}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          {item.scheduled_at && (
            <span className="text-xs text-muted-foreground">
              {new Date(item.scheduled_at).toLocaleDateString()}
            </span>
          )}
          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
            {item.status}
          </Badge>
        </div>
      </div>
    </div>
  )

  const renderCategoryResult = (item) => (
    <div
      key={`category-${item.id}`}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => handleResultClick(item.url)}
    >
      <div className="flex-shrink-0">
        <Award className="h-5 w-5 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {item.description}
          </p>
        )}
      </div>
    </div>
  )

  const renderResultResult = (item) => (
    <div
      key={`result-${item.id}`}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => handleResultClick(item.url)}
    >
      <div className="flex-shrink-0">
        <CheckCircle className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">{item.assessment_title}</p>
          <Badge variant="outline" className="text-xs">
            {item.type}
          </Badge>
          {item.passed !== null && (
            <Badge variant={item.passed ? "default" : "secondary"} className="text-xs">
              {item.passed ? "Passed" : "Failed"}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          {item.score !== null && (
            <span className="text-xs text-muted-foreground">
              Score: {item.score}%
            </span>
          )}
          {item.final_score !== null && (
            <span className="text-xs text-muted-foreground">
              Final: {item.final_score}%
            </span>
          )}
          {item.completed_at && (
            <span className="text-xs text-muted-foreground">
              {new Date(item.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const allResults = [
    ...(results.assessments || []).map(item => ({ ...item, type: 'assessment' })),
    ...(results.candidates || []).map(item => ({ ...item, type: 'candidate' })),
    ...(results.practice_problems || []).map(item => ({ ...item, type: 'practice_problem' })),
    ...(results.interviews || []).map(item => ({ ...item, type: 'interview' })),
    ...(results.categories || []).map(item => ({ ...item, type: 'category' })),
    ...(results.results || []).map(item => ({ ...item, type: 'result' }))
  ]

  const filteredResults = activeTab === 'all' 
    ? allResults 
    : allResults.filter(item => item.type === activeTab)

  const tabs = [
    { id: 'all', label: 'All', count: allResults.length },
    { id: 'assessment', label: 'Assessments', count: (results.assessments || []).length },
    { id: 'candidate', label: 'Candidates', count: (results.candidates || []).length },
    { id: 'practice_problem', label: 'Practice', count: (results.practice_problems || []).length },
    { id: 'interview', label: 'Interviews', count: (results.interviews || []).length },
    { id: 'category', label: 'Categories', count: (results.categories || []).length },
    { id: 'result', label: 'Results', count: (results.results || []).length }
  ].filter(tab => tab.count > 0 || tab.id === 'all')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search {userRole === 'recruiter' ? 'Recruiter' : 'Interviewee'} Dashboard</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search assessments, candidates, practice problems, interviews..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tabs */}
          {query.trim().length >= 2 && (
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="whitespace-nowrap"
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : query.trim().length >= 2 ? (
              filteredResults.length > 0 ? (
                filteredResults.map((item) => {
                  switch (item.type) {
                    case 'assessment':
                      return renderAssessmentResult(item)
                    case 'candidate':
                      return renderCandidateResult(item)
                    case 'practice_problem':
                      return renderPracticeProblemResult(item)
                    case 'interview':
                      return renderInterviewResult(item)
                    case 'category':
                      return renderCategoryResult(item)
                    case 'result':
                      return renderResultResult(item)
                    default:
                      return null
                  }
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-xs mt-1">Try different keywords or check your spelling</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start typing to search...</p>
                <p className="text-xs mt-1">Search for assessments, candidates, practice problems, and more</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 