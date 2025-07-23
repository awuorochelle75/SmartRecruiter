import React from "react";
import { Search } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/NavbarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Mock stats for dashboard cards ---
const availableTestsStatsData = [
  { id: 1, title: "Available Tests", value: "12" },
  { id: 2, title: "Completed", value: "1" },
  { id: 3, title: "Average Score", value: "85%" },
  { id: 4, title: "Time Saved", value: "12h" },
];

// --- Mock tests data ---
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
    title: "React Full Stack Challenge",
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

// --- Reusable stat card component ---
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

// --- Main Component ---
const AvailableTests = () => {
  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-900">
      {/* Fixed Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 z-20 border-r bg-white dark:bg-gray-800 shadow-md">
        <IntervieweeSidebar />
      </aside>

      {/* Main content wrapper shifted right with margin */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <NavbarDashboard />

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Tests</h2>
            <p className="text-gray-700 dark:text-gray-400">
              Discover and take assessments to showcase your skills
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {availableTestsStatsData.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} />
            ))}
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search tests by title, company, or skills..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Available</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {availableTestsCardData.map((test) => (
              <Card
                key={test.id}
                className="rounded-lg shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Title & Tags */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{test.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {test.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-2 py-1 text-xs font-semibold rounded-full text-blue-600 border-blue-600 bg-blue-50/20 dark:bg-blue-900/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${
                            test.difficulty === 'Intermediate'
                              ? 'text-yellow-600 border-yellow-600 bg-yellow-50/20 dark:bg-yellow-900/20'
                              : test.difficulty === 'Beginner'
                              ? 'text-green-600 border-green-600 bg-green-50/20 dark:bg-green-900/20'
                              : 'text-red-600 border-red-600 bg-red-50/20 dark:bg-red-900/20'
                          }`}
                      >
                        {test.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {/* Company Info */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{test.company}</p>

                  {/* Description */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">{test.description}</p>

                  {/* Details */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
                    <span>{test.duration}</span>
                    <span>{test.questions}</span>
                    <span>Passing: {test.passing}</span>
                    <span>Attempts: {test.attempts}</span>
                  </div>

                  {/* Start Test Button */}
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md"
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableTests;
