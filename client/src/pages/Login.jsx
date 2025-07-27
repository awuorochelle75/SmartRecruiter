"use client"

import { Eye, EyeOff, Code2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../components/ui/use-toast"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "interviewee",
  })
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Improved validation
    if (!formData.email || !formData.password) {
      toast({ title: "Error", description: "Email and password are required.", variant: "destructive" })
      return
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
      email: formData.email,
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error("Login error response:", data)
        toast({ title: "Error", description: data.error || "Login failed", variant: "destructive" })
        return
      }
      
      
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        credentials: "include",
      })
      
      if (userRes.ok) {
        const userData = await userRes.json()

        
        let onboardingStatus = true
        if (userData.role === 'interviewee') {
          onboardingStatus = !!userData.onboarding_completed
        }
        
        login({ 
          ...userData, 
          onboarding: onboardingStatus 
        })
        // localStorage.setItem("smartrecruiter_user", JSON.stringify(userData))
        // toast({ title: "Success", description: "Login successful!", variant: "default" })
        if (data.redirect) {
          navigate(data.redirect)
        } else {
          navigate("/")
        }
    } else {
        console.error("Failed to fetch user data:", userRes.status)
        toast({ title: "Error", description: "Failed to fetch user data", variant: "destructive" })
      }
    } catch (err) {
      console.error("Login error:", err)
      toast({ title: "Error", description: "Login failed: " + err.message, variant: "destructive" })
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    })
  }

  return (
    <div className="min-h-screen bg-background-alt">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Code2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">SmartRecruiter</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="interviewee">Interviewee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </div>

                <Button type="submit" className="w-full">
                  Sign In as {formData.role === "recruiter" ? "Recruiter" : "Interviewee"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary hover:underline">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}


