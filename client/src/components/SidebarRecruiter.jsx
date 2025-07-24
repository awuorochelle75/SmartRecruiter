import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart2,
  CalendarCheck,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Code2,
  Menu,
  X
} from 'lucide-react';
import { Separator } from '../components/ui/separator';

export default function SidebarRecruiter() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/recruiterdashboard" },
    { icon: FileText, label: "Create Assessment", path: "/createassessment" },
    { icon: FileText, label: "Assessment", path: "/assessments" },
    { icon: Users, label: "Candidates", path: "/candidates" },
    { icon: BarChart2, label: "Result & Analytics", path: "/resultsanalytics" },
    { icon: CalendarCheck, label: "Interviews", path: "/interview" },
    { icon: MessageSquare, label: "Messages", path: "/recruiter/messages" },
    { icon: User, label: "Profile", path: "/recruiter/profile" },
    { icon: Settings, label: "Settings", path: "/recruiter/settings" },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground shadow">
        <Link to="/" className="flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-sm font-bold">SmartRecruiter</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-foreground focus:outline-none">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground shadow-lg p-4 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
        `}
      >
        <div>
          {/* Logo */}
          <div className="hidden md:flex items-center mb-4">
            <Link to="/" className="flex items-center space-x-2 mt-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-bold">SmartRecruiter</span>
            </Link>
          </div>

          <Separator className="border-t border-border mb-4" />

          {/* Navigation Links */}
          <ul className="space-y-6 text-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-1 rounded-md transition-all
                      ${isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted text-muted-foreground dark:hover:bg-muted"
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout */}
        <div className="mt-6">
          <Separator className="border-t border-border mb-4" />
          <Link
            to="/"
            className="flex items-center space-x-3 text-muted-foreground hover:text-destructive text-sm"
            onClick={() => setIsOpen(false)}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </>
  );
}
