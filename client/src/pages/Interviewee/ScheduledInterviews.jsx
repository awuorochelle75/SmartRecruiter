import React from "react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar";
import NavbarDashboard from "../../components/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const scheduledInterviewsStatsData = [
  { id: 1, title: "Upcoming", value: "2" },
  { id: 2, title: "This week", value: "2" },
  { id: 3, title: "Completed", value: "1" },
  { id: 4, title: "Success Rate", value: "85%" },
];

const upcomingInterviewsData = [
  {
    id: 1,
    role: "Senior React Developer",
    company: "TechMoja Inc.",
    date: "18/08/2025",
    type: "Video Call",
    time: "14:00 (60 min)",
    interviewer: "James Abdala",
    interviewTypeBadge: "Technical Interview",
    statusBadge: "Upcoming",
    buttons: ["Join Meeting", "View Details"],
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Stata House",
    date: "18/08/2025",
    type: "Office Meeting",
    time: "14:00 (60 min)",
    interviewer: "William Ruto",
    interviewTypeBadge: "Behavioral Interview",
    statusBadge: "Upcoming",
    buttons: ["View Details"],
  },
];

const interviewTipsData = {
  before: [
    "Research the company and role.",
    "Prepare answers for common questions.",
    "Prepare specific examples using the STAR method",
    "Review your resume and be ready to discuss projects",
  ],
  during: ["Listen actively.", "Ask clarifying questions."],
  technical: ["Review data structures and algorithms.", "Practice coding challenges."],
};

const interviewHistoryData = [
  {
    id: 1,
    role: "Frontend Developer",
    company: "Safaricom Inc.",
    date: "11/05/2025",
    type: "Coding Interview",
    duration: "90 min",
    interviewer: "Bob Collimore",
    status: "Completed",
  },
];

const StatCard = ({ title, value }) => (
  <Card className="rounded-lg shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </CardContent>
  </Card>
);

const ScheduledInterviews = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <IntervieweeSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <NavbarDashboard />

        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scheduled Interviews</h2>
            <p className="text-gray-700 dark:text-gray-400">Prepare for your upcoming interviews</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {scheduledInterviewsStatsData.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} />
            ))}
          </div>

          {/* Main Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming Interviews */}
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-5 space-y-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Interviews</h3>
              <p className="text-gray-500 text-sm dark:text-gray-400">Your scheduled interviews</p>

              <div className="space-y-4 mt-4">
                {upcomingInterviewsData.map((interview) => (
                  <div key={interview.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                    {/* Badge aligned right */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{interview.role}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{interview.company}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{interview.date}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{interview.type}</p>

                        <Badge
                          variant="outline"
                          className="mt-2 text-blue-600 border-blue-600 bg-pink-100 dark:bg-blue-900/20 rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          {interview.interviewTypeBadge}
                        </Badge>
                      </div>

                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-600 bg-blue-50/20 dark:bg-blue-900/20 rounded-full px-2 py-1 text-xs font-semibold"
                      >
                        {interview.statusBadge}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-800 dark:text-gray-300">
                      <span className="font-medium">{interview.time}</span>
                      <span className="text-right">{interview.interviewer}</span>
                    </div>

                    <div
                      className={`flex flex-col sm:flex-row gap-2 pt-2 ${
                        interview.buttons.length === 1 ? "sm:justify-end" : ""
                      }`}
                    >
                      {interview.buttons.includes("Join Meeting") && (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-4 py-2 shadow-md">
                          Join Meeting
                        </Button>
                      )}
                      {interview.buttons.includes("View Details") && (
                        <Button
                          variant="outline"
                          className={`${
                            interview.buttons.length === 1 ? "w-full" : "flex-1"
                          } text-sm rounded-md px-4 py-2`}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Tips */}
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-5 space-y-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interview Tips</h3>
              <p className="text-gray-500 text-sm dark:text-gray-400">Prepare for your upcoming interviews</p>
              <div className="space-y-4 mt-4">
                {Object.entries(interviewTipsData).map(([section, tips]) => (
                  <div key={section}>
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {section} {section === "technical" ? "Interviews" : "the Interview"}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interview History */}
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-5 space-y-4 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interview History</h3>
            <p className="text-gray-500 text-sm dark:text-gray-400">Your completed interviews</p>
            <div className="space-y-4 mt-4">
              {interviewHistoryData.map((history) => (
                <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{history.role}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{history.company}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600 bg-green-50/20 dark:bg-green-900/20 rounded-full px-2 py-1 text-xs font-semibold"
                    >
                      {history.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Date: {history.date}</span>
                    <span>Type: {history.type}</span>
                    <span>Duration: {history.duration}</span>
                    <span>Interviewer: {history.interviewer}</span>
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

export default ScheduledInterviews;
