import React from "react";
import { Search, Bell, User } from "lucide-react"; // Icons for NavbarDashboard
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; // Adjust path if needed
import NavbarDashboard from "../../components/NavbarDashboard"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // For various sections
import { Button } from "@/components/ui/button"; // For action buttons
import { Input } from "@/components/ui/input"; // For input fields
import { Textarea } from "@/components/ui/textarea"; // For textarea (Bio)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For profile picture

// NEW CODE ADDED BELOW THIS LINE

// Mock data for the profile information
const profileData = {
  firstName: "Dorothy",
  lastName: "Chepkoech",
  email: "dorothy.cl@email.com",
  phone: "0700020001",
  location: "Nairobi Kenya",
  company: "Tech Solutions Inc.",
  position: "Senior Software Developer",
  bio: "Experienced software developer with a passion for building scalable and efficient web applications. Proficient in React, Node.js, and cloud technologies.",
  avatarUrl: "https://github.com/shadcn.png", // Placeholder avatar
  role: "Senior Software Engineer", // Displayed under name
  currentCompany: "Tech Solutions Inc.", // Displayed under role
};

// Mock data for skills (just a placeholder, actual rendering will be an image)
const skillsData = [
  { id: 1, name: "React" },
  { id: 2, name: "Javascript" },
  { id: 3, name: "Node.js" },
  { id: 4, name: "HTML" },
  { id: 5, name: "CSS" },
];

// Mock data for Recent Achievements (placeholder for now)
const recentAchievementsData = [
  "Led successful migration of legacy system to React.",
  "Developed a new microservice that improved performance by 30%.",
  "Mentored junior developers on best coding practices.",
];

// Mock data for Statistics (placeholder for now)
const statisticsData = "Your performance overview will be displayed here.";

// END NEW CODE ADDED

const IntervieweeProfile = () => {
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your personal information and preferences
              </p>
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md px-4 py-2 shadow-sm">
              Edit Profile
            </Button>
          </div>

          {/* Main Content Area: Two columns for Profile Info and Side Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Personal Information */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Personal Information</h3>
              {/* Placeholder for profile details and input fields */}
              <p className="text-gray-700 dark:text-gray-300">Profile content goes here.</p>
            </div>

            {/* Right Column: Skills, Recent Achievements, Statistics */}
            <div className="lg:col-span-1 space-y-6">
              {/* Skills Card */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h3>
                <p className="text-gray-600 dark:text-gray-400">Your technical expertise</p>
                {/* Placeholder for skills image */}
                <p className="text-gray-700 dark:text-gray-300">Skills content goes here.</p>
              </div>

              {/* Recent Achievements Card */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Achievements</h3>
                <p className="text-gray-600 dark:text-gray-400">Your latest accomplishments</p>
                {/* Placeholder for achievements list */}
                <p className="text-gray-700 dark:text-gray-300">Achievements content goes here.</p>
              </div>

              {/* Statistics Card */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Statistics</h3>
                <p className="text-gray-600 dark:text-gray-400">Your performance overview</p>
                {/* Placeholder for statistics content */}
                <p className="text-gray-700 dark:text-gray-300">Statistics content goes here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeProfile;
