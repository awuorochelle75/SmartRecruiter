"use client";

import { Link } from 'react-router-dom';
import { useState, useEffect } from "react"
import ThemeToggle from "./ThemeToggle"
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
import { useAuth } from "../contexts/AuthContext"
import { useNotifications } from "../contexts/NotificationContext"

function NavbarDashboard() {
  return (
    <nav className="w-full px-3 flex justify-between mt-3 bg-background text-foreground">
     
      <div className="w-[28rem]">
        <input
          type="text"
          placeholder="Search..."
          className="w-full border-input bg-background-alt text-foreground border rounded-md pl-10 pr-4 py-2 text-sm placeholder-muted-foreground"
        />
      </div>

      
      <div className="flex items-center gap-6">
        <ThemeToggle />

      
        <div className="relative cursor-pointer">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <Bell className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 bg-popover text-popover-foreground">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/notifications" className="w-full text-primary text-sm text-center">
                  View All Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

       
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              <Avatar>
                <AvatarImage src="/user.jpg" alt="User profile" />
                <AvatarFallback className="bg-primary text-primary-foreground hover:text-blue-600 transition-colors">
                  RA
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground">
            <DropdownMenuLabel>Rochelle Awuor</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              rochelleawuor@gmail.com
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}





export default NavbarDashboard;


