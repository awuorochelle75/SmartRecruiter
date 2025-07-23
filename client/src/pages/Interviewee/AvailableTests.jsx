import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; 
import NavbarDashboard from "../../components/NavbarDashboard"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
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
          {/* Placeholder for future content like stat cards, search, filters, and test list */}
          <p className="text-gray-700">Content for available tests will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default AvailableTests;
