"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, XCircle, Info, MessageSquare, Calendar, Settings, Award, BookOpen, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { useToast } from "../../components/ui/use-toast"
import IntervieweeSidebar from "../../components/IntervieweeSidebar"
import DashboardNavbar from "../../components/DashboardNavbar"
import { CardSkeleton } from "../../components/LoadingSkeleton"
import { useNotifications } from "../../contexts/NotificationContext"

export default function IntervieweeNotifications() {
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState({
    email_new_opportunities: true,
    email_assessment_results: true,
    email_interview_reminders: true,
    push_new_opportunities: true,
    push_assessment_results: true,
    push_interview_reminders: true,
    push_message_notifications: true,
    push_practice_updates: true,
    system_updates: true,
  })
  const { toast } = useToast()
  const { notifications, markAsRead, markAllAsRead, clearAllNotifications, fetchNotifications, loading: notificationsLoading } = useNotifications()

  useEffect(() => {
    fetchNotificationSettings()
    // Refresh notifications when component mounts
    fetchNotifications()
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/notifications`, {
        credentials: "include",
      })
      if (response.ok) {
        const settings = await response.json()
        setNotificationSettings(settings)
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error)
    }
  }

  const handleSettingChange = async (settingName) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [settingName]: !notificationSettings[settingName],
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newSettings),
      })
      
      if (response.ok) {
        setNotificationSettings(newSettings)
        toast({
          title: "Settings updated",
          description: "Notification preferences have been saved",
        })
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId)
      toast({
        title: "Marked as read",
        description: "Notification has been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast({
        title: "All marked as read",
        description: "All notifications have been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications()
      toast({
        title: "All notifications cleared",
        description: "All notifications have been cleared",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear all notifications",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "assessment":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "interview":
        return <Calendar className="h-5 w-5 text-purple-500" />
      case "practice":
        return <BookOpen className="h-5 w-5 text-orange-500" />
      case "achievement":
        return <Award className="h-5 w-5 text-yellow-500" />
      case "system":
        return <Settings className="h-5 w-5 text-gray-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading || notificationsLoading) {
    return (
      <div className="flex h-screen">
        <IntervieweeSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Notifications</h1>
                  <p className="text-muted-foreground">
                    Loading notifications...
                  </p>
                </div>
              </div>
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <IntervieweeSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">
                  Manage your notifications and preferences
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    fetchNotifications()
                    toast({
                      title: "Refreshed",
                      description: "Notifications have been refreshed",
                    })
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
                <Button variant="destructive" onClick={handleClearAllNotifications}>
                  Clear all
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notifications List */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Recent Notifications</span>
                    </CardTitle>
                    <CardDescription>
                      {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                    </CardDescription>
                </CardHeader>
                  <CardContent>
                  {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                      <div
                        key={notification.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border ${
                              notification.read ? "bg-muted/50" : "bg-background"
                        }`}
                      >
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {notification.content}
                          </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimestamp(notification.created_at)}
                              </p>
                        </div>
                        {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="flex-shrink-0"
                              >
                                Mark as read
                          </Button>
                        )}
                          </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>
              </div>

              {/* Notification Settings */}
              <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Choose which notifications you want to receive
                    </CardDescription>
                </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Email Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-new-opportunities" className="text-sm">
                            New Opportunities
                          </Label>
                          <Switch
                            id="email-new-opportunities"
                            checked={notificationSettings.email_new_opportunities}
                            onCheckedChange={() => handleSettingChange("email_new_opportunities")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-assessment-results" className="text-sm">
                            Assessment Results
                          </Label>
                          <Switch
                            id="email-assessment-results"
                            checked={notificationSettings.email_assessment_results}
                            onCheckedChange={() => handleSettingChange("email_assessment_results")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-interview-reminders" className="text-sm">
                            Interview Reminders
                          </Label>
                          <Switch
                            id="email-interview-reminders"
                            checked={notificationSettings.email_interview_reminders}
                            onCheckedChange={() => handleSettingChange("email_interview_reminders")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Push Notifications</h3>
                      <div className="space-y-3">
                  <div className="flex items-center justify-between">
                          <Label htmlFor="push-new-opportunities" className="text-sm">
                            New Opportunities
                    </Label>
                    <Switch
                            id="push-new-opportunities"
                            checked={notificationSettings.push_new_opportunities}
                            onCheckedChange={() => handleSettingChange("push_new_opportunities")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                          <Label htmlFor="push-assessment-results" className="text-sm">
                            Assessment Results
                    </Label>
                    <Switch
                            id="push-assessment-results"
                            checked={notificationSettings.push_assessment_results}
                            onCheckedChange={() => handleSettingChange("push_assessment_results")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                          <Label htmlFor="push-interview-reminders" className="text-sm">
                            Interview Reminders
                    </Label>
                    <Switch
                            id="push-interview-reminders"
                            checked={notificationSettings.push_interview_reminders}
                            onCheckedChange={() => handleSettingChange("push_interview_reminders")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                          <Label htmlFor="push-message-notifications" className="text-sm">
                            Message Notifications
                    </Label>
                    <Switch
                            id="push-message-notifications"
                            checked={notificationSettings.push_message_notifications}
                            onCheckedChange={() => handleSettingChange("push_message_notifications")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                          <Label htmlFor="push-practice-updates" className="text-sm">
                            Practice Updates
                          </Label>
                          <Switch
                            id="push-practice-updates"
                            checked={notificationSettings.push_practice_updates}
                            onCheckedChange={() => handleSettingChange("push_practice_updates")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Other Settings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Other</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-updates" className="text-sm">
                            System Updates
                    </Label>
                    <Switch
                            id="system-updates"
                            checked={notificationSettings.system_updates}
                            onCheckedChange={() => handleSettingChange("system_updates")}
                    />
                        </div>
                      </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
