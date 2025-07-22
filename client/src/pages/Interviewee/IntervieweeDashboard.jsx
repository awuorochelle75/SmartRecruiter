import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/NavbarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

const availableTestsData = [
  {
    id: 1,
    title: "React Development Assessment",
    company: "TechCorp Inc.",
    duration: "60 min",
    timeLeft: "3 days left",
    difficulty: "Intermediate",
  },
  {
    id: 2,
    title: "Javascript Fundamentals",
    company: "Ubiquenda Corp.",
    duration: "45 min",
    timeLeft: "5 days left",
    difficulty: "Beginner",
  },
  {
    id: 3,
    title: "Full Stack Challenge",
    company: "DevSolutions",
    duration: "120 min",
    timeLeft: "1 week left",
    difficulty: "Intermediate",
  },
];

const recentResultsData = [
  {
    id: 1,
    title: "Node.js Backend Test",
    company: "Safaricom",
    description: "Excellent problem-solving skills",
    score: 92,
    timeAgo: "2 days ago",
  },
  {
    id: 2,
    title: "Python Data Structure",
    company: "DataFlow",
    description: "Good understanding of algorithms",
    score: 78,
    timeAgo: "1 week ago",
  },
  {
    id: 3,
    title: "Frontend UI Challenge",
    company: "DesignHub",
    description: "Creative and responsive design",
    score: 88,
    timeAgo: "3 weeks ago",
  },
];

const upcomingInterviewsData = [
  {
    id: 1,
    company: "TechCorp Inc.",
    role: "Senior React Developer",
    dateTime: "Tomorrow, 2:00 PM",
    status: "Interview Scheduled",
  },
  {
    id: 2,
    company: "StartupXYZ",
    role: "Full Stack Developer",
    dateTime: "Friday, 10:00 AM",
    status: "Interview Scheduled",
  },
];

const skillProgressData = [
  { id: 1, skill: "Javascript", percentage: 92 },
  { id: 2, skill: "React", percentage: 88 },
  { id: 3, skill: "Node.js", percentage: 75 },
];

const StatCard = ({ title, value }) => (
  <Card className="rounded-lg shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </CardContent>
  </Card>
);

const IntervieweeDashboard = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <IntervieweeSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <NavbarDashboard />

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
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-md"
              >
                Start Practice
              </Button>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md px-4 py-2 shadow-sm"
              >
                Browse Tests
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
            <StatCard title="Tests Complete" value="8" />
            <StatCard title="Average Score" value="85" />
            <StatCard title="Practice Sessions" value="24" />
            <StatCard title="Rank" value="#23" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-lg shadow transition-transform duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-gray-900 darkk:text-white">
                  Available Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm dark:text-gray-400">
                  New assessment opportunities waiting for you
                </p>
                <div className="space-y-4 mt-4">
                  {availableTestsData.map((test) => (
                    <div
                      key={test.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {test.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {test.company}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {test.duration}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant="outline"
                          className={`px-2 py-1 text-xs font-semibold rounded-full w-24 text-center
                            ${
                              test.difficulty === "Intermediate"
                                ? "text-yellow-600 border-yellow-600 bg-yellow-50/20 dark:bg-yellow-900/20"
                                : test.difficulty === "Beginner"
                                ? "text-green-600 border-green-600 bg-green-50/20 dark:bg-green-900/20"
                                : "text-red-600 border-red-600 bg-red-50/20 dark:bg-red-900/20"
                            }`}
                        >
                          {test.difficulty}
                        </Badge>
                        <Button
                          variant="outline"
                          className="border-blue-600 bg-blue-500 text-white hover:bg-blue-700 hover:text-white rounded-xl px-4 py-1 text-xs h-auto min-h-0"
                        >
                          Start Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-sm transition-transform duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Your latest assessment performances
                </p>
                <div className="space-y-4 mt-4">
                  {recentResultsData.map((result) => (
                    <div
                      key={result.id}
                      className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {result.company}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {result.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {result.timeAgo}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {result.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Interviews Section */}
          <div className="bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-5 space-y-4 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Upcoming Interviews
            </h3>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              Your scheduled interviews this week
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingInterviewsData.map((interview) => (
                <Card
                  key={interview.id}
                  className="rounded-lg shadow-sm transition-transform duration-300 hover:scale-105"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {interview.company}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.role}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {interview.dateTime}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-600 bg-blue-50/20 dark:bg-blue-900/20 rounded-full px-3 py-1 text-xs font-semibold"
                      >
                        {interview.status}
                      </Badge>
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md px-3 py-1 text-xs"
                      >
                        Join Meeting
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Skill Progress Section */}
          <div className="bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Skill Progress
            </h3>
            <p className="text-gray-500 text-sm dark:text-gray-400 mb-4">
              Your improvement across different technical areas
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {skillProgressData.map((skill) => (
                <div key={skill.id} className="space-y-1 text-sm">
                  <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                    <span>{skill.skill}</span>
                    <span>{skill.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;
