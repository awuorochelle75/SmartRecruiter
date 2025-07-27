"use client"


import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Bell, Search } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import ThemeToggle from "./ThemeToggle"
import { useAuth } from "../contexts/AuthContext"
import { useNotifications } from "../contexts/NotificationContext"



export default function DashboardNavbar() {
  const [profile, setProfile] = useState(null)
  const { user: authUser, logout } = useAuth()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setProfile(data)
      })
      .catch((error) => console.error("Error fetching profile:", error))
  }, [])

  const userRole = authUser?.role

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">

        {/* <Link to={`/${userRole}/dashboard`} className="flex items-center space-x-2">
          <img src="/logo.svg" alt="SmartRecruiter Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-foreground">SmartRecruiter</span>
        </Link> */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-muted/50" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to={`/${userRole}/notifications`}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={profile && profile.avatar ? `${import.meta.env.VITE_API_URL}/uploads/avatars/${profile.avatar}` : "/placeholder.svg"}
                    alt={profile ? `${profile.first_name || ""} ${profile.last_name || ""}` : "User"}
                  />
                  <AvatarFallback>{profile ? `${(profile.first_name || "")[0] || "U"}${(profile.last_name || "")[0] || ""}` : "U"}</AvatarFallback>
                </Avatar>
              </Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Loading..."}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{profile?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/${userRole}/profile`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/${userRole}/settings`}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/${userRole}/notifications`}>Notifications</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/${userRole}/feedback`}>Feedback</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          
        </div>
      </div>
    </header>
  )
}








