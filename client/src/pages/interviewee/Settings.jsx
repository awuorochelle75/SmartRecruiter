"use client"

import { useState, useEffect, useRef } from "react"
import { Save, Bell, Shield, User, Briefcase, Globe, Eye, EyeOff, Camera } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Separator } from "../../components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { useToast } from "../../components/ui/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "../../components/ui/dialog"
import { useNavigate } from "react-router-dom"



const API_URL = import.meta.env.VITE_API_URL

function clearAllCookies() {
  document.cookie.split(';').forEach(c => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
}


export default function Settings() {
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    bio: "",
    website: "",
    linkedin: "",
    github: "",
    timezone: "",
    availability: "",
    salaryExpectation: "",
    workType: "",
    avatar: null,
  })
  const [skills, setSkills] = useState([])
  const [notifications, setNotifications] = useState({
    emailNewOpportunities: true,
    emailInterviewInvites: true,
    emailAssessmentInvites: true,
    emailResultsUpdates: true,
    pushNewOpportunities: false,
    pushInterviewReminders: true,
    pushAssessmentReminders: true,
    pushMessageNotifications: true,
    weeklyJobAlerts: true,
    monthlyProgressReports: false,
  })
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showSalaryExpectation: false,
    showContactInfo: true,
    allowRecruiterContact: true,
    showActivityStatus: true,
  })
  const [newSkill, setNewSkill] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const avatarInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [enable2FA, setEnable2FA] = useState(false)
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      // Profile
      const res = await fetch(`${API_URL}/profile`, { credentials: "include" })
      const data = await res.json()
      setProfileData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        title: data.title || "",
        bio: data.bio || "",
        website: data.website || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        timezone: data.timezone || "",
        availability: data.availability || "",
        salaryExpectation: data.salary_expectation || "",
        workType: data.work_type || "",
        avatar: data.avatar || null,
      })
      

      let parsedSkills = []
      if (Array.isArray(data.skills)) parsedSkills = data.skills
      else if (typeof data.skills === "string") parsedSkills = data.skills.split(",").map(s => s.trim()).filter(Boolean)
      setSkills(parsedSkills)
      if (data.avatar) setAvatarUrl(`${API_URL}/uploads/avatars/${data.avatar}`)
      const nres = await fetch(`${API_URL}/settings/notifications`, { credentials: "include" })
      const ndata = await nres.json()
      setNotifications({
        emailNewOpportunities: ndata.email_new_opportunities,
        emailInterviewInvites: ndata.email_interview_invites,
        emailAssessmentInvites: ndata.email_assessment_invites,
        emailResultsUpdates: ndata.email_results_updates,
        pushNewOpportunities: ndata.push_new_opportunities,
        pushInterviewReminders: ndata.push_interview_reminders,
        pushAssessmentReminders: ndata.push_assessment_reminders,
        pushMessageNotifications: ndata.push_message_notifications,
        weeklyJobAlerts: ndata.weekly_job_alerts,
        monthlyProgressReports: ndata.monthly_progress_reports,
      })
      setEnable2FA(!!ndata.monthly_progress_reports)
      const pres = await fetch(`${API_URL}/settings/privacy`, { credentials: "include" })
      const pdata = await pres.json()
      setPrivacy({
        profileVisibility: pdata.profile_visibility,
        showSalaryExpectation: pdata.show_salary_expectation,
        showContactInfo: pdata.show_contact_info,
        allowRecruiterContact: pdata.allow_recruiter_contact,
        showActivityStatus: pdata.show_activity_status,
      })
      setLoading(false)
    }
    fetchSettings()
  }, [])

  
  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }
  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }
  const handlePrivacyChange = (field, value) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }))
  }
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()])
      setNewSkill("")
    }
  }
  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove))
  }
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("avatar", file)
    try {
      const res = await fetch(`${API_URL}/profile/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to upload avatar", variant: "destructive" })
        return
      }
      setAvatarUrl(`${API_URL}/uploads/avatars/${data.avatar}`)
      toast({ title: "Success", description: "Avatar updated successfully!", variant: "default" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }
  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({ title: "Error", description: "Please fill in all password fields.", variant: "destructive" })
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New password and confirmation do not match.", variant: "destructive" })
      return
    }
    try {
      const res = await fetch(`${API_URL}/settings/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ current_password: passwords.current, new_password: passwords.new }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to update password", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Password updated successfully!", variant: "default" })
      setPasswords({ current: "", new: "", confirm: "" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }
  const handle2FAToggle = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enable_2fa: !enable2FA }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to update 2FA", variant: "destructive" })
        return
      }
      setEnable2FA((prev) => !prev)
      toast({ title: "Success", description: `Two-Factor Authentication ${!enable2FA ? "enabled" : "disabled"}!`, variant: "default" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }
  const handleSave = async () => {
    try {
      const pres = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          title: profileData.title,
          bio: profileData.bio,
          website: profileData.website,
          linkedin: profileData.linkedin,
          github: profileData.github,
          timezone: profileData.timezone,
          availability: profileData.availability,
          salary_expectation: profileData.salaryExpectation,
          work_type: profileData.workType,
          skills: skills.join(","),
        }),
      })
      const pdata = await pres.json()
      if (!pres.ok) {
        toast({ title: "Error", description: pdata.error || "Failed to update profile", variant: "destructive" })
        return
      }
      const nres = await fetch(`${API_URL}/settings/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email_new_opportunities: notifications.emailNewOpportunities,
          email_interview_invites: notifications.emailInterviewInvites,
          email_assessment_invites: notifications.emailAssessmentInvites,
          email_results_updates: notifications.emailResultsUpdates,
          push_new_opportunities: notifications.pushNewOpportunities,
          push_interview_reminders: notifications.pushInterviewReminders,
          push_assessment_reminders: notifications.pushAssessmentReminders,
          push_message_notifications: notifications.pushMessageNotifications,
          weekly_job_alerts: notifications.weeklyJobAlerts,
          monthly_progress_reports: notifications.monthlyProgressReports,
        }),
      })
      const ndata = await nres.json()
      if (!nres.ok) {
        toast({ title: "Error", description: ndata.error || "Failed to update notifications", variant: "destructive" })
        return
      }
      

      const pres2 = await fetch(`${API_URL}/settings/privacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_visibility: privacy.profileVisibility,
          show_salary_expectation: privacy.showSalaryExpectation,
          show_contact_info: privacy.showContactInfo,
          allow_recruiter_contact: privacy.allowRecruiterContact,
          show_activity_status: privacy.showActivityStatus,
        }),
      })
      const pdata2 = await pres2.json()
      if (!pres2.ok) {
        toast({ title: "Error", description: pdata2.error || "Failed to update privacy settings", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Settings updated successfully!", variant: "default" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }


  const handleDeleteAccount = async () => {
    try {
      setDeleteDialogOpen(false)
      const res = await fetch(`${API_URL}/settings/delete-account`, {
        method: "POST",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to delete account", variant: "destructive" })
        return
      }
      toast({ title: "Account Deleted", description: "Your account and all data have been deleted.", variant: "default" })
      setTimeout(() => {
        clearAllCookies()
        window.location.href = "/login"
      }, 1500)
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <IntervieweeSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and application preferences</p>
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>


            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Update your personal information and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                

                <div className="flex items-center space-x-4">
                  <div className="relative">
                  <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={`${profileData.firstName} ${profileData.lastName}`} />
                    <AvatarFallback className="text-lg">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
                      onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                      tabIndex={-1}
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                      />
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleProfileChange("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={profileData.timezone}
                      onValueChange={(value) => handleProfileChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => handleProfileChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell recruiters about your experience and what you're looking for..."
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => handleProfileChange("website", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={profileData.linkedin}
                      onChange={(e) => handleProfileChange("linkedin", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={profileData.github}
                      onChange={(e) => handleProfileChange("github", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Professional Preferences</span>
                </CardTitle>
                <CardDescription>Set your job search preferences and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={profileData.availability}
                      onValueChange={(value) => handleProfileChange("availability", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="2weeks">2 weeks notice</SelectItem>
                        <SelectItem value="1month">1 month notice</SelectItem>
                        <SelectItem value="3months">3+ months</SelectItem>
                        <SelectItem value="not-looking">Not actively looking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workType">Work Type Preference</Label>
                    <Select
                      value={profileData.workType}
                      onValueChange={(value) => handleProfileChange("workType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryExpectation">Salary Expectation (USD)</Label>
                    <Input
                      id="salaryExpectation"
                      type="number"
                      value={profileData.salaryExpectation}
                      onChange={(e) => handleProfileChange("salaryExpectation", e.target.value)}
                    />
                  </div>
                </div>



                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., React, Python, Design)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Choose how you want to be notified about opportunities and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Job Opportunities</p>
                        <p className="text-sm text-muted-foreground">Get notified about relevant job openings</p>
                      </div>
                      <Switch
                        checked={notifications.emailNewOpportunities}
                        onCheckedChange={(checked) => handleNotificationChange("emailNewOpportunities", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Invitations</p>
                        <p className="text-sm text-muted-foreground">When recruiters invite you for interviews</p>
                      </div>
                      <Switch
                        checked={notifications.emailInterviewInvites}
                        onCheckedChange={(checked) => handleNotificationChange("emailInterviewInvites", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assessment Invitations</p>
                        <p className="text-sm text-muted-foreground">When you're invited to take assessments</p>
                      </div>
                      <Switch
                        checked={notifications.emailAssessmentInvites}
                        onCheckedChange={(checked) => handleNotificationChange("emailAssessmentInvites", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Results & Updates</p>
                        <p className="text-sm text-muted-foreground">Assessment results and application updates</p>
                      </div>
                      <Switch
                        checked={notifications.emailResultsUpdates}
                        onCheckedChange={(checked) => handleNotificationChange("emailResultsUpdates", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Opportunities</p>
                        <p className="text-sm text-muted-foreground">Instant notifications for new job matches</p>
                      </div>
                      <Switch
                        checked={notifications.pushNewOpportunities}
                        onCheckedChange={(checked) => handleNotificationChange("pushNewOpportunities", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming interviews</p>
                      </div>
                      <Switch
                        checked={notifications.pushInterviewReminders}
                        onCheckedChange={(checked) => handleNotificationChange("pushInterviewReminders", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assessment Reminders</p>
                        <p className="text-sm text-muted-foreground">Reminders for pending assessments</p>
                      </div>
                      <Switch
                        checked={notifications.pushAssessmentReminders}
                        onCheckedChange={(checked) => handleNotificationChange("pushAssessmentReminders", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Messages</p>
                        <p className="text-sm text-muted-foreground">When recruiters send you messages</p>
                      </div>
                      <Switch
                        checked={notifications.pushMessageNotifications}
                        onCheckedChange={(checked) => handleNotificationChange("pushMessageNotifications", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Reports & Insights</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Job Alerts</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of new opportunities</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyJobAlerts}
                        onCheckedChange={(checked) => handleNotificationChange("weeklyJobAlerts", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Progress Reports</p>
                        <p className="text-sm text-muted-foreground">Your application and skill progress</p>
                      </div>
                      <Switch
                        checked={notifications.monthlyProgressReports}
                        onCheckedChange={(checked) => handleNotificationChange("monthlyProgressReports", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Privacy & Visibility</span>
                </CardTitle>
                <CardDescription>Control who can see your profile and contact you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Who can see your profile</p>
                    </div>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="recruiters-only">Recruiters Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Salary Expectation</p>
                      <p className="text-sm text-muted-foreground">Display your salary expectations to recruiters</p>
                    </div>
                    <Switch
                      checked={privacy.showSalaryExpectation}
                      onCheckedChange={(checked) => handlePrivacyChange("showSalaryExpectation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Contact Information</p>
                      <p className="text-sm text-muted-foreground">Allow recruiters to see your contact details</p>
                    </div>
                    <Switch
                      checked={privacy.showContactInfo}
                      onCheckedChange={(checked) => handlePrivacyChange("showContactInfo", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Recruiter Contact</p>
                      <p className="text-sm text-muted-foreground">Let recruiters message you directly</p>
                    </div>
                    <Switch
                      checked={privacy.allowRecruiterContact}
                      onCheckedChange={(checked) => handlePrivacyChange("allowRecruiterContact", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Activity Status</p>
                      <p className="text-sm text-muted-foreground">Display when you were last active</p>
                    </div>
                    <Switch
                      checked={privacy.showActivityStatus}
                      onCheckedChange={(checked) => handlePrivacyChange("showActivityStatus", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword.current ? "text" : "password"}
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                            tabIndex={-1}
                          >
                            {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword.new ? "text" : "password"}
                            value={passwords.new}
                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                            tabIndex={-1}
                          >
                            {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                            tabIndex={-1}
                          >
                            {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-2 bg-transparent" onClick={handlePasswordChange}>
                      Update Password
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                    <Switch
                      checked={enable2FA}
                      onCheckedChange={handle2FAToggle}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Download Your Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">Get a copy of your profile data and activity</p>
                    <Button variant="outline" className="bg-transparent">
                      Request Data Export
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data
                    </p>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            This action is <span className="text-destructive font-semibold">permanent</span> and will delete your account and all associated data. <br />
                            <b>This cannot be undone.</b> Are you sure you want to proceed?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button variant="destructive" onClick={handleDeleteAccount}>Yes, Delete My Account</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


