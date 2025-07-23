import React from "react";
import { Search, Bell, User, Eye } from "lucide-react"; 
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; 
import NavbarDashboard from "../../components/NavbarDashboard"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge"; 
import { Progress } from "@/components/ui/progress"; 


// Mock data for the statistical cards on the My Results page
const myResultsStatsData = [
  { id: 1, title: "Average Score", value: "80.5%" },
  { id: 2, title: "Completion Rate", value: "87%" },
  { id: 3, title: "Average Time", value: "52 min" },
  { id: 4, title: "Pass Rate", value: "73%" },
];

// Mock data for the assessment results table
const myAssessmentResultsData = [
  {
    id: 1,
    assessment: "Frontend Development Assessment",
    score: 90,
    status: "Completed",
    timeSpend: "45 min",
    completedDate: "20/5/2025",
  },
  {
    id: 2,
    assessment: "Full Stack Challenge",
    score: 85,
    status: "Completed",
    timeSpend: "98 min",
    completedDate: "12/3/2025",
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


const MyResults = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <IntervieweeSidebar />

      <div className="flex-1 flex flex-col">
        <NavbarDashboard/>

        <div className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Results
          </h2>
          <p className="text-gray-700 dark:text-gray-400">
            View and analyze your assessment results performance
          </p>
          {/* Stat Cards Section: Displays key performance metrics in a responsive grid. */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {myResultsStatsData.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyResults;
