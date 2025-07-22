import React from "react";
import { Search, Bell, User } from "lucide-react";

const NavbarDashboard = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      {/* Search Bar */}
      <div className="relative flex items-center w-full max-w-md">
        <Search className="absolute left-3 text-gray-400 dark:text-gray-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-4 ml-4">
        <button className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 rounded-full p-2">
          <Bell className="h-6 w-6" />
        </button>
        <button className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 rounded-full p-2">
          <User className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default NavbarDashboard;
