import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../components/ui/dropdown-menu"



export default function PracticeProblems() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    starter_code: "",
    solution: "",
    test_cases: "",
    tags: [],
    category_id: ""
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [problemToDelete, setProblemToDelete] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchProblems()
  }, [selectedCategory])

  function fetchCategories() {
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategories(data))
  }

  function fetchProblems() {
    let url = `${import.meta.env.VITE_API_URL}/practice-problems`
    if (selectedCategory) url += `?category_id=${selectedCategory}`
    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => setProblems(data))
  }

  function handleFormChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleTagInput(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      setForm(f => ({ ...f, tags: [...f.tags, e.target.value.trim()] }))
      e.target.value = ""
    }
  }

  function handleEdit(problem) {
    navigate(`/recruiter/practice-problems/edit/${problem.id}`)
  }

  function handleDelete(problem) {
    setProblemToDelete(problem)
    setShowDeleteDialog(true)
  }

  function handleDetails(problem) {
    navigate(`/recruiter/practice-problems/details/${problem.id}`)
  }

  async function confirmDelete() {
    if (!problemToDelete) return
    const problem = problemToDelete
    setShowDeleteDialog(false)
    setProblemToDelete(null)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/practice-problems/${problem.id}`, {
      method: "DELETE",
      credentials: "include"
    })
    if (res.ok) {
      toast({ title: "Deleted", description: `Problem '${problem.title}' deleted.` })
      fetchProblems()
    } else {
      toast({ title: "Error", description: "Failed to delete problem", variant: "destructive" })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const method = editing ? "PUT" : "POST"
    const url = editing
      ? `${import.meta.env.VITE_API_URL}/practice-problems/${editing}`
      : `${import.meta.env.VITE_API_URL}/practice-problems`
    fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).then(res => {
      if (res.ok) {
        toast({ title: editing ? "Updated" : "Created", description: `Problem '${form.title}' ${editing ? "updated" : "created"}.` })
        setShowDialog(false)
        setEditing(null)
        setForm({ title: "", description: "", difficulty: "Easy", starter_code: "", solution: "", test_cases: "", tags: [], category_id: "" })
        fetchProblems()
      } else {
        toast({ title: "Error", description: "Failed to save problem", variant: "destructive" })
      }
    })
  }

  function getDifficultyColor(difficulty) {
    switch (difficulty.toLowerCase()) {
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

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Practice Problems</h1>
            <Button onClick={() => navigate("/recruiter/practice-problems/create")}>Add Problem</Button>
          </div>
          <div className="mb-4 flex gap-4 items-center">
            <Select value={selectedCategory === "" ? "uncategorized" : selectedCategory} onValueChange={v => setSelectedCategory(v === "uncategorized" ? "" : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map(problem => (
              <Card key={problem.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold mb-1">{problem.title}</h3>
                      <div className="mb-2 text-sm text-muted-foreground">{problem.category || "Uncategorized"}</div>
                      <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(problem)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(problem)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDetails(problem)}>
                          <Eye className="h-4 w-4 mr-2" /> Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">{problem.description}</div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {problem.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">Created: {problem.created_at?.slice(0, 10)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Practice Problem</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete <span className="font-semibold">{problemToDelete?.title}</span>? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 

