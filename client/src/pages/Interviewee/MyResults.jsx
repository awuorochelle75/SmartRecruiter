import React from "react";
import { Search, Eye } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/NavbarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data
const myResultsStatsData = [
  { id: 1, title: "Average Score", value: "80.5%" },
  { id: 2, title: "Completion Rate", value: "87%" },
  { id: 3, title: "Average Time", value: "52 min" },
  { id: 4, title: "Pass Rate", value: "73%" },
];

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

// Reusable card for stats
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
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900">
      <aside className="fixed top-0 left-0 h-screen w-64 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md">
        <IntervieweeSidebar />
      </aside>

      <div className="ml-64 w-full flex flex-col min-h-screen">
        <NavbarDashboard />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-x-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">My Results</h2>
              <p className="text-gray-700 dark:text-gray-400">View and analyze your assessment results performance</p>
            </div>
            <div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md">
                Export Results
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {myResultsStatsData.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} />
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search assessments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Sort By Score</option>
                <option>Highest to Lowest</option>
                <option>Lowest to Highest</option>
              </select>
            </div>
          </div>

          {/* Assessment Results Table */}
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-5 border border-gray-100 dark:border-gray-700 overflow-x-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">My Assessment Results</h3>
            <p className="text-gray-500 text-sm dark:text-gray-400 mb-4">Detailed results for your completed assessments</p>

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Assessment</th>
                  <th className="px-4 py-3 text-left">Score</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Time Spend</th>
                  <th className="px-4 py-3 text-left">Completed</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {myAssessmentResultsData.map((result) => (
                  <tr key={result.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{result.assessment}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white">{result.score}%</span>
                        <Progress
                          value={result.score}
                          className="w-24 h-2 bg-gray-200 dark:bg-gray-700"
                          indicatorClassName="bg-blue-500"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${result.status === 'Completed'
                          ? 'text-green-600 border-green-600 bg-green-50/20 dark:bg-green-900/20'
                          : ''}`}>
                        {result.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{result.timeSpend}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{result.completedDate}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                        <Eye className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyResults;
