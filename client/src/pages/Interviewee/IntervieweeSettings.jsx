import React from "react";
import { Search, Bell, User, Upload } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data for profile information in settings
const settingsProfileData = {
  firstName: "Dorothy",
  lastName: "Chepkoech",
  email: "dorothy.cl@email.com",
  phone: "0700020001",
  location: "Nairobi, Kenya",
  timezone: "Eastern Time",
  professionalTitle: "Senior React Developer",
  professionalBio: "Passionate frontend developer with 5+ years of experience building scalable and efficient web applications.",
  website: "https://dorothy.dev",
  linkedin: "https://linkedin.com/in/dorothy",
  github: "https://github.com/dorothyh",
  avatarUrl: "https://github.com/shadcn.png", // Placeholder avatar
};

// Mock data for profile information (availability, work type, salary)
const profileInfoData = {
  availability: "Immediately",
  workTypePreference: "Hybrid",
  salaryExpectation: "500,000",
  skills: ["React", "Javascript", "TypeScript", "Node.js", "CSS", "HTML"], // Updated skills as per design
};

// Mock data for security settings
const securityData = {
  currentPassword: "", // Not pre-filled for security
  newPassword: "",     // Not pre-filled for security
};

const IntervieweeSettings = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 h-screen">
        <IntervieweeSidebar />
      </div>

      <div className="flex-1 flex flex-col lg:pl-64">
        <NavbarDashboard/>

        <div className="flex-1 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your profile and application preferences
              </p>
            </div>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md">
              Save Changes
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Update your personal information and professional details</p>

              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={settingsProfileData.avatarUrl} alt="User Avatar" />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {settingsProfileData.firstName.charAt(0)}{settingsProfileData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Button variant="outline" className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md px-3 py-2 text-sm">
                    <Upload className="h-4 w-4" />
                    <span>Change Photo</span>
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG or .GIF. Max size 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    id="settings-firstName"
                    type="text"
                    defaultValue={settingsProfileData.firstName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    id="settings-lastName"
                    type="text"
                    defaultValue={settingsProfileData.lastName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <Input
                    id="settings-email"
                    type="email"
                    defaultValue={settingsProfileData.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <Input
                    id="settings-phone"
                    type="tel"
                    defaultValue={settingsProfileData.phone}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <Input
                    id="settings-location"
                    type="text"
                    defaultValue={settingsProfileData.location}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timezone
                  </label>
                  <Select defaultValue={settingsProfileData.timezone}>
                    <SelectTrigger id="settings-timezone" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectItem value="Eastern Time">Eastern Time</SelectItem>
                      <SelectItem value="Central Time">Central Time</SelectItem>
                      <SelectItem value="Mountain Time">Mountain Time</SelectItem>
                      <SelectItem value="Pacific Time">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                      <SelectItem value="EAT">EAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="settings-professionalTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Title
                  </label>
                  <Input
                    id="settings-professionalTitle"
                    type="text"
                    defaultValue={settingsProfileData.professionalTitle}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="settings-professionalBio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Bio
                  </label>
                  <Textarea
                    id="settings-professionalBio"
                    defaultValue={settingsProfileData.professionalBio}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="settings-website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website
                  </label>
                  <Input
                    id="settings-website"
                    type="url"
                    defaultValue={settingsProfileData.website}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LinkedIn
                  </label>
                  <Input
                    id="settings-linkedin"
                    type="url"
                    defaultValue={settingsProfileData.linkedin}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="settings-github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Github
                  </label>
                  <Input
                    id="settings-github"
                    type="url"
                    defaultValue={settingsProfileData.github}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Profile Information Section (Availability, Work Type, Salary, Skills) */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Update your personal information and professional details</p>

              {/* Availability, Work Type, Salary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="settings-availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Availability
                  </label>
                  <Select defaultValue={profileInfoData.availability}>
                    <SelectTrigger id="settings-availability" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectItem value="Immediately">Immediately</SelectItem>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="3 months+">3 months+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="settings-workType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work Type Preference
                  </label>
                  <Select defaultValue={profileInfoData.workTypePreference}>
                    <SelectTrigger id="settings-workType" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="settings-salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salary Expectation (Ksh)
                  </label>
                  <Input
                    id="settings-salary"
                    type="text"
                    defaultValue={profileInfoData.salaryExpectation}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Skills Input and Badges */}
              <div className="space-y-2">
                <label htmlFor="settings-skills-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </label>
                {/* Badges displayed ABOVE the input field */}
                <div className="flex flex-wrap gap-2">
                  {profileInfoData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1 text-sm font-medium rounded-full border-gray-300 text-gray-700 bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                {/* Input field and Add button */}
                <div className="flex items-center space-x-2">
                  <Input
                    id="settings-skills-input"
                    type="text"
                    placeholder="Add a skill (e.g. React, Javascript, Frontend)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage your account security settings</p>

              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <Input
                      id="current-password"
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <Input
                      id="new-password"
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-white dark:bg-blue-600 dark:hover:bg-blue-900/20 rounded-md px-4 py-2 shadow-sm">
                  Update Password
                </Button>
              </div>

              {/* Delete Account */}
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 shadow-sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeSettings;
