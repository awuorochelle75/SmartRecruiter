import React from 'react';
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
  Code2
} from 'lucide-react';
import { Separator } from '../components/ui/separator'

export default function SidebarRecruiter() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/recruiterdashboard" },
    { icon: FileText, label: "Create Assessment", path: "/create-assessment" },
    { icon: FileText, label: "Assessment", path: "/assessments" },
    { icon: Users, label: "Candidates", path: "/candidates" },
    { icon: BarChart2, label: "ResultAnalytics", path: "/resultsanalytics" },
    { icon: CalendarCheck, label: "Interviews", path: "/recruiter/interviews" },
    { icon: MessageSquare, label: "Messages", path: "/recruiter/messages" },
    { icon: User, label: "Profile", path: "/recruiter/profile" },
    { icon: Settings, label: "Settings", path: "/recruiter/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-100 shadow-lg fixed top-0 left-0 p-4 flex flex-col justify-between">
      <div>
        
        <div className="flex items-center mb-4">
          <Link to="/" className="flex items-center space-x-2 mt-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-sm font-bold text-foreground">SmartRecruiter</span>
          </Link>
        </div>

        <hr className="border-t border-gray-300 mb-4" />

       
        <ul className="space-y-6 text-gray-700 text-sm">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-1 ${
                    isActive
                      ?  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold"
                      :  "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      
      <div className="mt-6">
      <Separator className="border-t border-gray-300 mb-4 " /> 
        <Link
          to="/logout"
          className="flex items-center space-x-3 text-gray-700 hover:text-red-600 text-sm"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}
