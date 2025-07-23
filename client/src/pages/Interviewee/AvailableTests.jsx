import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; 
import NavbarDashboard from "../../components/NavbarDashboard"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";  
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge"; 


// Mock data for the statistical cards on the Available Tests page
const availableTestsStatsData = [
  { id: 1, title: "Available Tests", value: "12" },
  { id: 2, title: "Completed", value: "1" },
  { id: 3, title: "Average Score", value: "85%" },
  { id: 4, title: "Time Saved", value: "12h" },
];

// Mock data for the individual test cards
const availableTestsCardData = [
  {
    id: 1,
    title: "React Development Assessment",
    company: "Safaricom Corp.",
    description: "Comprehensive React assessment covering hooks, state management, and component architecture.",
    duration: "60 min",
    questions: "25 questions",
    passing: "70%",
    attempts: "1/2",
    difficulty: "Intermediate",
    tags: ["React", "Frontend"],
  },
  {
    id: 2,
    title: "Javascript Fundamentals",
    company: "Safaricom Corp.",
    description: "Comprehensive React assessment covering hooks, state management, and component architecture.",
    duration: "60 min",
    questions: "25 questions",
    passing: "70%",
    attempts: "1/2",
    difficulty: "Beginner",
    tags: ["Javascript", "Fundamentals"],
  },
  {
    id: 3,
    title: "React aFull Stack Challenge",
    company: "DevSolutions",
    description: "Comprehensive React assessment covering hooks, state management, and component architecture.",
    duration: "60 min",
    questions: "25 questions",
    passing: "70%",
    attempts: "1/2",
    difficulty: "Advanced",
    tags: ["Javascript", "React"],
  },
];

// StatCard Component: Reusable component to display a single statistical metric.
const StatCard = ({ title, value }) => (
  <Card className="rounded-lg shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </CardContent>
  </Card>
);


const AvailableTests = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <IntervieweeSidebar />

      <div className="flex-1 flex flex-col">
        
        <NavbarDashboard/>

        <div className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Available Tests
          </h2>
          <p className="text-gray-700 dark:text-gray-400">
            Discover and take assessments to showcase your skills
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {availableTestsStatsData.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} />
            ))}
          </div>
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search tests by title, company, or skills..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            {/* Filter Dropdowns  */}
            <div className="flex space-x-2">
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Available</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableTests;
