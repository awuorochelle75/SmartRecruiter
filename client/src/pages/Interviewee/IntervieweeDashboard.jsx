import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; 
import NavbarDashboard from "../../components/NavbarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


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
        <div className="flex-1 p-6">
        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;
