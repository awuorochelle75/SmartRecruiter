import React from "react";
import { Search, Bell, User, Upload } from "lucide-react"; // Icons for NavbarDashboard and Upload icon
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; // Adjust path if needed
import NavbarDashboard from "../../components/NavbarDashboard"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // For various sections
import { Button } from "@/components/ui/button"; // For action buttons
import { Input } from "@/components/ui/input"; // For input fields
import { Textarea } from "@/components/ui/textarea"; // For textarea (Professional Bio)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For profile picture
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For dropdowns
import { Badge } from "@/components/ui/badge"; // For skill badges

// Mock data for profile information in settings
const settingsProfileData = {
  firstName: "Dorothy",
  lastName: "Chepkoech",
  email: "dorothy.cl@email.com",
  phone: "0700020001",
  location: "Nairobi, Kenya",
  timezone: "Eastern Time",
  professionalTitle: "Senior React Developer",
  professionalBio: "Passionate frontend developer with 5+ years of experience building scalable web applications.",
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
  skills: ["React", "Javascript", "Node.js", "Frontend"], // Initial skills
};

// Mock data for security settings
const securityData = {
  currentPassword: "", // Not pre-filled for security
  newPassword: "",     // Not pre-filled for security
};

const IntervieweeSettings = () => {
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

          {/* Main Content Area: Profile Information, Profile Information (second section), Security */}
          <div className="space-y-6"> {/* Use space-y-6 for vertical spacing between main sections */}
            {/* Profile Information Section (Personal Details) - NOW POPULATED */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Update your personal information and professional details</p>

              {/* Avatar and Change Photo */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24"> {/* Increased size for settings page */}
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

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
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
                {/* Last Name */}
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
                {/* Email */}
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
                {/* Phone Number */}
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
                {/* Location */}
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
                {/* Timezone */}
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
                {/* Professional Title */}
                <div className="md:col-span-2"> {/* Spans full width on medium screens */}
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
                {/* Professional Bio */}
                <div className="md:col-span-2"> {/* Spans full width on medium screens */}
                  <label htmlFor="settings-professionalBio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Bio
                  </label>
                  <Textarea
                    id="settings-professionalBio"
                    defaultValue={settingsProfileData.professionalBio}
                    rows={4} // Adjusted rows for a more compact look
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Website */}
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
                {/* LinkedIn */}
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
                {/* GitHub */}
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
              {/* Placeholder for Profile Info (second section) content */}
              <p className="text-gray-700 dark:text-gray-300">Second profile information content goes here.</p>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage your account security settings</p>
              {/* Placeholder for Security content */}
              <p className="text-700 dark:text-gray-300">Security content goes here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeSettings;
