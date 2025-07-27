"use client"

import { useState, useEffect } from "react"
import { Camera, Save, Edit, Mail, Phone, MapPin, Calendar, Award } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { CardSkeleton } from "../../components/LoadingSkeleton"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../components/ui/use-toast"
import { useRef } from "react"

export default function Profile() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState(null)
  const [profileStats, setProfileStats] = useState(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    company: "",
    position: "",
  })
  const [skills, setSkills] = useState([])
  const fileInputRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/profile`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data)
        setFormData({
          firstName: data.first_name || authUser?.first_name || "",
          lastName: data.last_name || authUser?.last_name || "",
          email: data.email || authUser?.email || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          company: data.company || "",
          position: data.position || "",
        })
        

        let parsedSkills = []
        if (Array.isArray(data.skills)) {
          parsedSkills = data.skills
        } else if (typeof data.skills === "string") {
          parsedSkills = data.skills.split(",").map(s => s.trim()).filter(Boolean)
        }
        setSkills(parsedSkills)
        if (data.avatar) {
          setAvatarUrl(`${import.meta.env.VITE_API_URL}/uploads/avatars/${data.avatar}`)
        } else {
          setAvatarUrl("")
        }
      })

      .catch((error) => {
        setFormData({
          firstName: authUser?.first_name || "",
          lastName: authUser?.last_name || "",
          email: authUser?.email || "",
          phone: "",
          location: "",
          bio: "",
          company: "",
          position: "",
        })
        setSkills([])
        setAvatarUrl("")
      })

      

    fetch(`${import.meta.env.VITE_API_URL}/profile/interviewee/stats`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setProfileStats(data)
        if (data.skills && data.skills.length > 0) {
          setSkills(data.skills)
        }
      })
      .catch((error) => {
        console.error('Error fetching profile stats:', error)
        setProfileStats({
          stats: {
            assessments_completed: 0,
            average_score: 0,
            rank: 0,
            member_since: 'Unknown'
          },
          skills: [],
          achievements: []
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [authUser])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }



  const handleSave = async () => {
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        company: formData.company,
        position: formData.position,
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        toast({ title: "Error", description: err.error || "Failed to update profile", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Profile updated successfully!", variant: "default" })
    setEditing(false)
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile: " + err.message, variant: "destructive" })
    }
  }


  

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("avatar", file)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to upload avatar", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Avatar updated successfully!", variant: "default" })
      setAvatarUrl(`${import.meta.env.VITE_API_URL}/uploads/avatars/${data.avatar}`)
    } catch (err) {
      toast({ title: "Error", description: "Failed to upload avatar: " + err.message, variant: "destructive" })
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

  return (
    <div className="flex h-screen bg-background">
      <IntervieweeSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and preferences</p>
              </div>
              <Button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                variant={editing ? "default" : "outline"}
              >
                {editing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={avatarUrl || "/placeholder.svg"}
                          alt={`${formData.firstName} ${formData.lastName}`}
                        />
                        <AvatarFallback className="text-lg">
                          {formData.firstName[0]}
                          {formData.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleAvatarChange}
                          />
                        </Button>
                      )}
                    </div>


                    <div>
                      <h3 className="text-lg font-semibold">
                        {formData.firstName} {formData.lastName}
                      </h3>
                      <p className="text-muted-foreground">{formData.position}</p>
                      <p className="text-sm text-muted-foreground">{formData.company}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>Your technical expertise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profileStats?.skills?.length > 0 ? (
                        profileStats.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills added yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>



                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                    <CardDescription>Your latest accomplishments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profileStats?.achievements?.length > 0 ? (
                        profileStats.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Award className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No achievements yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>Your performance overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Assessments Completed</span>
                        <span className="font-medium">{profileStats?.stats?.assessments_completed || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Score</span>
                        <span className="font-medium">{profileStats?.stats?.average_score || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rank</span>
                        <span className="font-medium">#{profileStats?.stats?.rank || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Member Since</span>
                        <span className="font-medium">{profileStats?.stats?.member_since || 'Unknown'}</span>
                      </div>
                    </div>
                  </CardContent>


                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}



