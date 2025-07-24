import React from "react";
import { Search, Bell, User, Play } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/NavbarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";


// Mock data for the statistical cards on the Practice Arena page
const practiceArenaStatsData = [
  { id: 1, title: "Problem Solved", value: "173" },
  { id: 2, title: "Success Rate", value: "78%" },
  { id: 3, title: "Avg. Time", value: "24m" },
  { id: 4, title: "Streak", value: "12" },
];

// Mock data for the practice categories/cards
const practiceCategoriesData = [
  {
    id: 1,
    title: "Algorithms",
    tag: "Mixed",
    description: "Practice algorithmic problem solving",
  },
  {
    id: 2,
    title: "Data Structures",
    tag: "Mixed",
    description: "Practice algorithmic problem solving",
  },
  {
    id: 3,
    title: "System Design",
    tag: "Mixed",
    description: "Practice algorithmic problem solving",
  },
  {
    id: 4,
    title: "Javascript",
    tag: "Mixed",
    description: "Practice algorithmic problem solving",
  },
];

// StatCard Component: Reusable component to display a single statistical metric.
const StatCard = ({ title, value }) => (
  <Card className="rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"> {/* Added dark mode classes */}
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </CardContent>
  </Card>
);



const PracticeArena = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900"> {/* Added dark mode bg */}
      <aside className="fixed top-0 left-0 h-screen w-64 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md">
        <IntervieweeSidebar />
      </aside>

      <div className="ml-64 w-full flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900"> {/* Added dark mode bg */}
        <NavbarDashboard/>

        <div className="flex-1 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Practice Arena
              </h2>
              <p className="text-gray-700 dark:text-gray-400">
                Sharpen your coding skills with hands-on practice
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md">
                Start Practice
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md px-4 py-2 shadow-sm dark:border-blue-500 dark:text-blue-300"> {/* Added dark mode border/text */}
                Browse Tests
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {practiceArenaStatsData.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} />
            ))}
          </div>
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700"> {/* Added dark mode border */}
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 -mb-px dark:text-blue-400 dark:border-blue-400">
              Categories
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white -mb-px">
              Categories
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white -mb-px">
              Recently Activity
            </button>
          </div>     

          {/* Practice Category Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {practiceCategoriesData.map((category) => (
              <Card key={category.id} className="rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"> {/* Added dark mode classes */}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.title}</h3>
                  </div>
                  <Badge variant="default" className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      {category.tag}
                    </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                  <Progress value={70} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-blue-500" />
                  <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md flex items-center justify-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Start Practice</span>
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

export default PracticeArena;
