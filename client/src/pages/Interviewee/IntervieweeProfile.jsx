import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Profile data mock
const profileData = {
  firstName: "Dorothy",
  lastName: "Chepkoech",
  email: "dorothy.cl@email.com",
  phone: "0700020001",
  location: "Nairobi Kenya",
  company: "Tech Solutions Inc.",
  position: "Senior Software Developer",
  bio: "Experienced software developer with a passion for building scalable and efficient web applications. Proficient in React, Node.js, and cloud technologies.",
  avatarUrl: "https://github.com/shadcn.png",
  role: "Senior Software Engineer",
  currentCompany: "Tech Solutions Inc.",
};

const skillsData = [
  { id: 1, name: "React" },
  { id: 2, name: "Javascript" },
  { id: 3, name: "Node.js" },
  { id: 4, name: "SQL" },
];

const IntervieweeProfile = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Fixed Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md hidden md:block">
        <IntervieweeSidebar />
      </aside>

      {/* Main Content: pushes right to avoid overlap with fixed sidebar */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        {/* Top Navbar */}
        <NavbarDashboard />

        {/* Page Content */}
        <main className="flex-1 p-6 space-y-6">
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
            <Button variant="outline" className="rounded-md px-4 py-2 shadow-sm border-gray-300 text-white bg-blue-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Edit Profile
            </Button>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Form */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Personal Information</h3>

              {/* Avatar & Name */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatarUrl} alt="User Avatar" />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profileData.firstName} {profileData.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{profileData.currentCompany}</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <Input id="firstName" type="text" defaultValue={profileData.firstName} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <Input id="lastName" type="text" defaultValue={profileData.lastName} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input id="email" type="email" defaultValue={profileData.email} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <Input id="phone" type="tel" defaultValue={profileData.phone} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <Input id="location" type="text" defaultValue={profileData.location} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                  <Input id="company" type="text" defaultValue={profileData.company} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                  <Input id="position" type="text" defaultValue={profileData.position} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <Textarea id="bio" rows={5} defaultValue={profileData.bio} className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
            </div>

            {/* Sidebar Cards (Skills, Achievements, Statistics) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h3>
                <p className="text-gray-600 dark:text-gray-400">Your technical expertise</p>
                <div className="flex flex-wrap gap-2">
                  {skillsData.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="px-3 py-1 text-sm font-medium rounded-full border-gray-300 text-gray-700 bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Achievements</h3>
                <p className="text-gray-600 dark:text-gray-400">Your latest accomplishments</p>
                <p className="text-gray-700 dark:text-gray-300">Achievements content goes here.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Statistics</h3>
                <p className="text-gray-600 dark:text-gray-400">Your performance overview</p>
                <p className="text-gray-700 dark:text-gray-300">Statistics content goes here.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IntervieweeProfile;
