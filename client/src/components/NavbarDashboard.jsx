import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Code2, Search, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NavbarDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white dark:bg-gray-900 px-4 py-3 flex justify-between items-center border-b shadow-sm">

      {/* Search Bar */}
      <div className="relative flex items-center w-full max-w-md">
        <Search className="absolute left-3 text-gray-400 dark:text-gray-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 ml-4">
        <Link
          to="/"
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
        >
          Home
        </Link>

        <button className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 p-1.5 rounded-full">
          <Bell className="h-5 w-5" />
        </button>

        <ThemeToggle />

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src="https://i.pravatar.cc/40?img=12"
            alt="Avatar"
            className="h-9 w-9 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold">Isaac Mwiti</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">isaacm@gmail.com</p>
              </div>
              <Link
                to="#"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profile
              </Link>
              <Link
                to="#"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Settings
              </Link>
              <Link
                to="#"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarDashboard;
