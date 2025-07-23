import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';

const IntervieweeSidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/IntervieweeDashboard" },
    { icon: FileText, label: "Available Test", path: "/availabletest" },
    { icon: FileText, label: "My Result", path: "/results" },
    { icon: Users, label: "Practice Arena", path: "/practice" },
    { icon: FileText, label: "Scheduled Interviews", path: "/interviews" },
    { icon: FileText, label: "Messages", path: "/messages" },
    { icon: MessageSquare, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen rounded-tr-lg rounded-br-lg shadow-lg">
      <div className="p-4 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-blue-600 text-2xl font-bold">&lt;/&gt;</span>
        <span className="text-gray-900 dark:text-white text-lg font-semibold">SmartRecruiter</span>
      </div>

      <nav className="flex-1 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/logout"
          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default IntervieweeSidebar;
