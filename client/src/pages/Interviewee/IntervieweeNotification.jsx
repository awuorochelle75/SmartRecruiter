import React from "react";
import { Search, Bell, User } from "lucide-react"; // Icons for NavbarDashboard
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; // Adjust path if needed
import NavbarDashboard from "../../components/NavbarDashboard"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // For various sections
import { Button } from "@/components/ui/button"; // For action buttons
import { Switch } from "@/components/ui/switch"; // For notification toggles

// Mock data for notifications
const notificationsData = [
  {
    id: 1,
    title: "New practice assessment 'Advanced Algorithms' is now available",
    time: "3 hours ago",
    read: false,
    type: "new_test",
  },
  {
    id: 2,
    title: "Your 'React Developer Assessment' results are ready. Score: 92%",
    time: "6 hours ago",
    read: false,
    type: "results",
  },
  {
    id: 3,
    title: "Failed to submit 'Python Basics Quiz'. Please check your internet connection",
    time: "1 day ago",
    read: true,
    type: "error",
  },
];

const IntervieweeNotification = () => {
  // Calculate unread count for the header
  const unreadCount = notificationsData.filter(notif => !notif.read).length;

  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900">
      {/* Sidebar: This component provides the left-hand navigation. */}
      {/* It's imported from '../../components/IntervieweeSidebar'. */}
      <IntervieweeSidebar />

      {/* Main Content: This flexible container holds the NavbarDashboard and the main page content. */}
      <div className="flex-1 flex flex-col">
        {/* NavbarDashboard: This component serves as the top bar of the dashboard. */}
        {/* It's imported from '../../components/NavbarDashboard'. */}
        <NavbarDashboard/>

        {/* Page Content: This is the primary area where dashboard-specific content is rendered. */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white"> {/* Reduced from text-2xl to text-xl */}
                Notifications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400"> {/* Reduced from default to text-sm */}
                Manage your alerts and notification preferences.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md px-3 py-1.5 text-sm"> {/* Reduced px/py, kept text-sm */}
                Mark All as Read
              </Button>
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-1.5 text-sm"> {/* Reduced px/py, kept text-sm */}
                Clear All
              </Button>
            </div>
          </div>

          {/* Main Content Area: Two columns for Alerts and Notification Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Your Alerts - NOW POPULATED */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Alerts ({unreadCount} unread)</h3> {/* Reduced from text-xl to text-lg */}
              <p className="text-sm text-gray-600 dark:text-gray-400">Stay up-to-date with important activities.</p> {/* Reduced from default to text-sm */}
              <div className="space-y-4">
                {notificationsData.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex justify-between items-center p-3 rounded-md border ${ /* Reduced padding */
                      notification.read
                        ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div>
                      <p className={`font-medium text-base ${notification.read ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}> {/* Reduced from default to text-base */}
                        {notification.title}
                      </p>
                      <p className={`text-xs ${notification.read ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-400"}`}> {/* Reduced from text-sm to text-xs */}
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button variant="outline" className="ml-4 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md px-2.5 py-1 text-xs"> {/* Reduced px/py, text-xs */}
                        Mark as Read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Notification Settings - NOW POPULATED */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notification Settings</h3> {/* Reduced from text-xl to text-lg */}
              <p className="text-sm text-gray-600 dark:text-gray-400">Control what notifications you receive</p> {/* Reduced from default to text-sm */}
              <div className="space-y-6">
                {/* New Test Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base text-gray-900 dark:text-white">New Test Alerts</p> {/* Reduced from default to text-base */}
                    <p className="text-xs text-gray-600 dark:text-gray-400"> {/* Reduced from text-sm to text-xs */}
                      Get notified when new assessments are available.
                    </p>
                  </div>
                  <Switch defaultChecked={true} className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-600 dark:data-[state=unchecked]:bg-gray-600" />
                </div>
                {/* System Updates */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base text-gray-900 dark:text-white">System Updates</p> {/* Reduced from default to text-base */}
                    <p className="text-xs text-gray-600 dark:text-gray-400"> {/* Reduced from text-sm to text-xs */}
                      Receive important announcements and feature updates.
                    </p>
                  </div>
                  <Switch defaultChecked={false} className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-600 dark:data-[state=unchecked]:bg-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeNotification;
