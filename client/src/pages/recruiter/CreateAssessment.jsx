import DashboardNavbar from '../../components/DashboardNavbar'
import NavbarDashboard from '../../components/DashboardNavbar'
import { useState } from "react"
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, MoreVertical } from 'lucide-react'

export default function CreateAssessment() {
  const [questionType, setQuestionType] = useState("multiple")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      
      <div className="hidden md:block w-64">
        <DashboardNavbar />
      </div>

      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-white dark:bg-gray-900 shadow-md h-full">
            <DashboardNavbar />
          </div>
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
      
        <div className="h-16 bg-background border-b border-border shadow-sm flex items-center justify-between px-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <MoreVertical className="h-6 w-6" />
          </button>
          <NavbarDashboard />
        </div>

       
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Create Assessment</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Design a comprehensive technical assignment.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/createassessment">Save draft</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/invite candidates">Publish</Link>
              </Button>
            </div>
          </div>

          
          <Card className="bg-card border border-border rounded shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Assessment Title</label>
                  <Input placeholder="Enter assessment title" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Assessment Type</label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="aptitude">Aptitude</SelectItem>
                      <SelectItem value="personality">Personality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea placeholder="Description" className="min-h-[100px]" />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <Input type="number" placeholder="60" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                  <Input type="number" placeholder="e.g. 70" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructions for Candidates</label>
                <Textarea placeholder="Provide clear instructions..." className="min-h-[100px]" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter a tag" />
                  <Button type="button">Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

         
          <Card className="bg-card border border-border rounded shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Questions (0)</CardTitle>
              <CardDescription>Add questions to evaluate candidate skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              <h2 className="text-md font-semibold">Add New Question</h2>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                      <SelectItem value="codechallenge">Code Challenge</SelectItem>
                      <SelectItem value="shortanswer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Points</label>
                  <Input type="number" placeholder="e.g. 5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <Textarea placeholder="Enter your question..." className="min-h-[100px]" />
              </div>

              {questionType === "multiple" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Answer Options</label>
                  <RadioGroup className="space-y-3">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="flex items-center gap-3">
                        <RadioGroupItem value={`option${index}`} id={`option${index}`} />
                        <Input placeholder={`Option ${index}`} className="flex-1" />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {questionType === "codechallenge" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Starter Code</label>
                    <Textarea placeholder="Provide starter code..." className="min-h-[100px] font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Output</label>
                    <Textarea placeholder="Expected output..." className="min-h-[80px] font-mono" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                <Textarea placeholder="Explain the correct answer..." className="min-h-[100px]" />
              </div>

              <div className="pt-6">
                <Button variant="default" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </CardContent>
          </Card>

          
          <Card className="bg-card border border-border rounded shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              {[
                { label: "Questions", value: "3" },
                { label: "Duration", value: "60 mins" },
                { label: "Passing Score", value: "70%" },
                { label: "Total Points", value: "15" },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-semibold">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
