"use client"

import { useState, useEffect, useRef } from "react"
import { Save, Bell, Shield, User, Building, Eye, EyeOff, Camera } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Switch } from "../../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Separator } from "../../components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import RecruiterSidebar from "../../components/RecruiterSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { useToast } from "../../components/ui/use-toast"

const API_URL = import.meta.env.VITE_API_URL




export default function Settings() {
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    bio: "",
    timezone: "",
    location: "",
    avatar: null,
  })
  const [companySettings, setCompanySettings] = useState({
    companyName: "",
    industry: "",
    size: "",
    website: "",
    description: "",
    logo: null,
  })
  const [notifications, setNotifications] = useState({
    emailNewApplications: true,
    emailAssessmentCompleted: true,
    emailInterviewReminders: true,
    pushNewApplications: false,
    pushAssessmentCompleted: true,
    pushInterviewReminders: true,
    weeklyReports: true,
    monthlyAnalytics: false,
  })
  const [avatarUrl, setAvatarUrl] = useState("")
  const [companyLogoUrl, setCompanyLogoUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [enable2FA, setEnable2FA] = useState(false)
  const avatarInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })

  
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      const res = await fetch(`${API_URL}/profile`, { credentials: "include" })
      const data = await res.json()
      setProfileData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        position: data.position || data.role || "",
        bio: data.bio || "",
        timezone: data.timezone || "",
        location: data.location || "",
        avatar: data.avatar || null,
      })
      setCompanySettings({
        companyName: data.company_name || "",
        industry: data.industry || "",
        size: data.company_size || "",
        website: data.company_website || "",
        description: data.company_description || "",
        logo: data.company_logo || null,
      })
      if (data.avatar) setAvatarUrl(`${API_URL}/uploads/avatars/${data.avatar}`)
      if (data.company_logo) setCompanyLogoUrl(`${API_URL}/uploads/avatars/${data.company_logo}`)
      const nres = await fetch(`${API_URL}/settings/notifications`, { credentials: "include" })
      const ndata = await nres.json()
      setNotifications({
        emailNewApplications: ndata.email_new_applications,
        emailAssessmentCompleted: ndata.email_assessment_completed,
        emailInterviewReminders: ndata.email_interview_reminders,
        pushNewApplications: ndata.push_new_applications,
        pushAssessmentCompleted: ndata.push_assessment_completed,
        pushInterviewReminders: ndata.push_interview_reminders,
        weeklyReports: ndata.weekly_reports,
        monthlyAnalytics: ndata.monthly_analytics,
      })
      setEnable2FA(!!ndata.monthly_analytics)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }
  const handleCompanyChange = (field, value) => {
    setCompanySettings((prev) => ({ ...prev, [field]: value }))
  }
  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
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
  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("logo", file)
    try {
      const res = await fetch(`${API_URL}/profile/company_logo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to upload logo", variant: "destructive" })
        return
      }
      setCompanyLogoUrl(`${API_URL}/uploads/avatars/${data.company_logo}`)
      toast({ title: "Success", description: "Company logo updated successfully!", variant: "default" })
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
          position: profileData.position,
          bio: profileData.bio,
          timezone: profileData.timezone,
          location: profileData.location,
          company_name: companySettings.companyName,
          industry: companySettings.industry,
          company_size: companySettings.size,
          company_website: companySettings.website,
          company_description: companySettings.description,
          company_logo: companySettings.logo,
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
          email_new_applications: notifications.emailNewApplications,
          email_assessment_completed: notifications.emailAssessmentCompleted,
          email_interview_reminders: notifications.emailInterviewReminders,
          push_new_applications: notifications.pushNewApplications,
          push_assessment_completed: notifications.pushAssessmentCompleted,
          push_interview_reminders: notifications.pushInterviewReminders,
          weekly_reports: notifications.weeklyReports,
          monthly_analytics: notifications.monthlyAnalytics,
        }),
      })
      const ndata = await nres.json()
      if (!nres.ok) {
        toast({ title: "Error", description: ndata.error || "Failed to update notifications", variant: "destructive" })
        return
      }
      toast({ title: "Success", description: "Settings updated successfully!", variant: "default" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application preferences</p>
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
                <CardDescription>Update your personal information and contact details</CardDescription>
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
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => handleProfileChange("position", e.target.value)}
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
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>Manage your company profile and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companySettings.companyName}
                      onChange={(e) => handleCompanyChange("companyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={companySettings.industry}
                      onValueChange={(value) => handleCompanyChange("industry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={companySettings.size} onValueChange={(value) => handleCompanyChange("size", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={companySettings.website}
                      onChange={(e) => handleCompanyChange("website", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    placeholder="Describe your company..."
                    value={companySettings.description}
                    onChange={(e) => handleCompanyChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Choose how you want to be notified about important events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Applications</p>
                        <p className="text-sm text-muted-foreground">Get notified when candidates apply</p>
                      </div>
                      <Switch
                        checked={notifications.emailNewApplications}
                        onCheckedChange={(checked) => handleNotificationChange("emailNewApplications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assessment Completed</p>
                        <p className="text-sm text-muted-foreground">When candidates complete assessments</p>
                      </div>
                      <Switch
                        checked={notifications.emailAssessmentCompleted}
                        onCheckedChange={(checked) => handleNotificationChange("emailAssessmentCompleted", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming interviews</p>
                      </div>
                      <Switch
                        checked={notifications.emailInterviewReminders}
                        onCheckedChange={(checked) => handleNotificationChange("emailInterviewReminders", checked)}
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
                        <p className="font-medium">New Applications</p>
                        <p className="text-sm text-muted-foreground">Instant notifications for new applications</p>
                      </div>
                      <Switch
                        checked={notifications.pushNewApplications}
                        onCheckedChange={(checked) => handleNotificationChange("pushNewApplications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assessment Completed</p>
                        <p className="text-sm text-muted-foreground">Instant notifications for completed assessments</p>
                      </div>
                      <Switch
                        checked={notifications.pushAssessmentCompleted}
                        onCheckedChange={(checked) => handleNotificationChange("pushAssessmentCompleted", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-muted-foreground">Push reminders for interviews</p>
                      </div>
                      <Switch
                        checked={notifications.pushInterviewReminders}
                        onCheckedChange={(checked) => handleNotificationChange("pushInterviewReminders", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Reports & Analytics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of hiring activities</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Analytics</p>
                        <p className="text-sm text-muted-foreground">Detailed monthly performance analytics</p>
                      </div>
                      <Switch
                        checked={notifications.monthlyAnalytics}
                        onCheckedChange={(checked) => handleNotificationChange("monthlyAnalytics", checked)}
                      />
                    </div>
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
                <CardDescription>Manage your account security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input id="currentPassword" type={showPassword.current ? "text" : "password"} value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))} tabIndex={-1}>
                            {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input id="newPassword" type={showPassword.new ? "text" : "password"} value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} />
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))} tabIndex={-1}>
                            {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input id="confirmPassword" type={showPassword.confirm ? "text" : "password"} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))} tabIndex={-1}>
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
                    <Button variant="outline" className="bg-transparent">
                      Enable 2FA
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Active Sessions</h4>
                    <p className="text-sm text-muted-foreground mb-4">Manage your active login sessions</p>
                    <Button variant="outline" className="bg-transparent">
                      View Sessions
                    </Button>
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



