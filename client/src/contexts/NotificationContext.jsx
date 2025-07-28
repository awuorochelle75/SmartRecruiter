"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAllNotifications: () => {},
  loading: false,
})

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        const unread = data.filter(n => !n.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/unread-count`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unread_count)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-all-read`, {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/clear-all`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error)
    }
  }

  

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [user])

  

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const currentPath = window.location.pathname
      const isOnMessagesPage = currentPath.includes('/messages')
      
      if (!isOnMessagesPage) {
        fetchUnreadCount()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}



export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
} 