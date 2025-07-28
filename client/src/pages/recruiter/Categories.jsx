import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { useToast } from "../../components/ui/use-toast"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { Trash2, Edit, Plus } from "lucide-react"
import { Label } from "../../components/ui/label"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function Categories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [form, setForm] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)



  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`, { credentials: "include" })
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }

  const openCreate = () => {
    setEditCategory(null)
    setForm({ name: "", description: "" })
    setShowDialog(true)
  }
  const openEdit = (cat) => {
    setEditCategory(cat)
    setForm({ name: cat.name, description: cat.description || "" })
    setShowDialog(true)
  }
  const openDeleteDialog = (cat) => {
    setCategoryToDelete(cat)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = async () => {
    if (categoryToDelete) {
      await handleDelete(categoryToDelete)
      setCategoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }
  const handleDelete = async (cat) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/${cat.id}`, { method: "DELETE", credentials: "include" })
    if (res.ok) {
      toast({ title: "Deleted", description: `Category '${cat.name}' deleted.`, variant: "default" })
      fetchCategories()
    } else {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
    }
  }
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    let res, data
    if (editCategory) {
      res = await fetch(`${import.meta.env.VITE_API_URL}/categories/${editCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      data = await res.json()
    } else {
      res = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      data = await res.json()
    }
    setSaving(false)
    if (res.ok) {
      setShowDialog(false)
      fetchCategories()
      toast({ title: "Success", description: `Category ${editCategory ? "updated" : "created"}.`, variant: "default" })
    } else {
      toast({ title: "Error", description: data.error || "Failed to save category", variant: "destructive" })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                <p className="text-muted-foreground">Organize your assessments by category</p>
              </div>
              <Button onClick={openCreate} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> New Category
              </Button>
            </div>
            <Card className="shadow-md border bg-background">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Manage Categories</CardTitle>
                <CardDescription>View, create, and edit categories for your assessments.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No categories found.</div>
                ) : (
                  <ul className="divide-y rounded-lg overflow-hidden bg-muted/30">
                    {categories.map(cat => (
                      <li key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 hover:bg-muted transition-colors group">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg text-foreground truncate">{cat.name}</div>
                          {cat.description && <div className="text-sm text-muted-foreground truncate mt-1">{cat.description}</div>}
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(cat)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(cat)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>



            
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="w-full max-w-2xl p-0 rounded-xl">
                <Card className="shadow-none border-0 bg-background">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-left">{editCategory ? "Edit Category" : "New Category"}</CardTitle>
                    <CardDescription>{editCategory ? "Update the category details." : "Create a new category for organizing your assessments."}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                      <div>
                        <Label>Name</Label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required maxLength={100} className="text-base py-2" />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="text-base py-2" />
                      </div>
                      <Button type="submit" className="w-full h-12 text-lg font-semibold mt-2" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    </form>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Category?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <b>{categoryToDelete?.name}</b>?
                    <br />This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
} 


