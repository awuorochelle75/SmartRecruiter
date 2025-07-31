"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Code2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  MessageSquare,
  BookOpen,
  FolderOpen,
  ClipboardList,
} from "lucide-react"
import { Button } from "./ui/button"
import { Tooltip } from "./ui/tooltip"
import { cn } from "../lib/utils"
import { useAuth } from "../contexts/AuthContext"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/recruiter/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Assessment",
    href: "/recruiter/create-assessment",
    icon: Plus,
  },
  {
    title: "Create Test Assessment",
    href: "/recruiter/create-test-assessment",
    icon: BookOpen,
  },
  {
    title: "Practice Problems",
    href: "/recruiter/practice-problems",
    icon: FileText,
  },
  {
    title: "Categories",
    href: "/recruiter/categories",
    icon: FolderOpen,
  },
  {
    title: "Assessments",
    href: "/recruiter/assessments",
    icon: ClipboardList,
  },
  {
    title: "Candidates",
    href: "/recruiter/candidates",
    icon: Users,
  },
  {
    title: "Results & Analytics",
    href: "/recruiter/analytics",
    icon: BarChart3,
  },
  {
    title: "Interviews",
    href: "/recruiter/interviews",
    icon: Calendar,
  },
  {
    title: "Messages",
    href: "/recruiter/messages",
    icon: MessageSquare,
  },
]

export default function RecruiterSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('recruiter-sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const location = useLocation()
  const { logout } = useAuth()

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem('recruiter-sidebar-collapsed', JSON.stringify(newCollapsed))
  }

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-sidebar-primary" />
            <div>
              <span className="font-bold text-sidebar-foreground">SmartRecruiter</span>
              <p className="text-xs text-sidebar-foreground/70">Recruiter Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Tooltip key={item.href} content={item.title} show={collapsed}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center space-x-0"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
                {collapsed && isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-sidebar-accent-foreground rounded-r-full"></div>
                )}
              </Link>
            </Tooltip>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Tooltip content="Logout" show={collapsed}>
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
