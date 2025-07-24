import React from "react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/NavbarDashboard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Mock notifications
const notificationsData = [
  {
    id: 1,
    title: "New practice assessment 'Advanced Algorithms' is now available",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Your 'React Developer Assessment' results are ready. Score: 92%",
    time: "6 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "Failed to submit 'Python Basics Quiz'. Please check your internet connection",
    time: "1 day ago",
    read: true,
  },
];

const IntervieweeNotification = () => {
  const unreadCount = notificationsData.filter((notif) => !notif.read).length;

  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900">
      {/* Sticky Sidebar */}
      <aside className="sticky top-0 h-screen hidden lg:block">
        <IntervieweeSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        <NavbarDashboard />

        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your alerts and notification preferences.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-sm px-3 py-1.5">
                Mark All as Read
              </Button>
              <Button variant="destructive" className="text-sm px-3 py-1.5">
                Clear All
              </Button>
            </div>
          </div>

          {/* Notification Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alerts */}
            <section className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Your Alerts ({unreadCount} unread)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stay up-to-date with important activities.
                </p>
              </div>
              {notificationsData.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex justify-between items-center p-3 rounded-md border ${
                    notification.read
                      ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div>
                    <p
                      className={`font-medium text-base ${
                        notification.read
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p
                      className={`text-xs ${
                        notification.read
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      className="ml-4 text-xs px-2.5 py-1"
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              ))}
            </section>

            {/* Notification Settings */}
            <aside className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Notification Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control what notifications you receive
                </p>
              </div>

              {/* Toggle Items */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base text-gray-900 dark:text-white">
                      New Test Alerts
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Get notified when new assessments are available.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base text-gray-900 dark:text-white">
                      System Updates
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Receive important announcements and feature updates.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntervieweeNotification;
