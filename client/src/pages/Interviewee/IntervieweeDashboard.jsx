import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; 
import NavbarDashboard from "../../components/NavbarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const interviewsData = [
  {
    id: 1,
    name: "James Kiplimo",
    role: "Senior React Developer",
    email: "james.kiplimo@gmail.com",
    duration: "60 minutes",
    interviewer: "John Smith",
    type: "Technical Interview",
    notes: "Notes: Focus on React hooks and state management",
    status: "Scheduled",
    dateTime: "26/07/25 at 14:00",
    avatar: "https://github.com/shadcn.png",
    avatarFallback: "JK",
  },
  {
    id: 2,
    name: "James Kiplimo",
    role: "Senior React Developer",
    email: "james.kiplimo@gmail.com",
    duration: "60 minutes",
    interviewer: "John Smith",
    type: "Behavioral Interview",
    notes: "Notes: Focus on React hooks and state management",
    status: "Scheduled",
    dateTime: "28/07/25 at 10:30",
    avatar: "https://github.com/shadcn.png",
    avatarFallback: "JK",
  },
];


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


const IntervieweeDashboard = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <IntervieweeSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <NavbarDashboard/>

        {/* Page Content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="flex  flex-col md:flex-row  md:items-center md:justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome Back!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress and discover new opportunities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md">Start Practice</Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md px-4 py-2 shadow-sm">
                Browse Tests
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard  title="Tests Complete" value="8"/>
            <StatCard title="Average Score" value="85"/>
            <StatCard title="Practice Sessions" value="24" />
            <StatCard title="Rank" value="#23" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-lg shadow">
              <CardHeader>
                <CardTitle className="text-gray-900 darkk:text-white">Available Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className=""></p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;
