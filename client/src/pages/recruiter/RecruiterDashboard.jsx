import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import DashboardNavbar from '../../components/DashboardNavbar';
import NavbarDashboard from '../../components/DashboardNavbar';
import { Button } from '../../components/ui/button';
import {Card,CardHeader,CardTitle,CardDescription,CardContent, } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function RecruiterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground dark:bg-background dark:text-foreground overflow-hidden relative">
     
      <div className="hidden md:block w-64">
        <DashboardNavbar />
      </div>

      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-white dark:bg-gray-900 shadow-md h-full">
            <DashboardNavbar />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

     
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <div className="h-16 bg-background border-b border-border shadow-sm flex items-center justify-between px-4">
         
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <MoreVertical className="h-6 w-6" />
          </button>

         
          <NavbarDashboard />
        </div>

      
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted dark:bg-muted space-y-10">
         
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Recruiter Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your assessments and track candidate performance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/createassessment">Create assessment</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/invitecandidates">Invite candidates</Link>
              </Button>
            </div>
          </div>

        
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Active Assessments', value: '12' },
              { title: 'Total Candidates', value: '248' },
              { title: 'Completion Rate', value: '87%' },
              { title: 'Average Score', value: '78.5' },
            ].map((stat, i) => (
              <Card key={i} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-primary text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{stat.value}</CardContent>
              </Card>
            ))}
          </div>

        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
            <Card className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Recent Candidate Activity</CardTitle>
                <CardDescription>Latest submissions and progress updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@example.com",
                    role: "Frontend Dev Test",
                    status: "Completed",
                    score: "92%",
                    time: "2 days ago",
                  },
                  {
                    name: "Mike Chen",
                    email: "mike.chen@example.com",
                    role: "Backend Dev Test",
                    status: "In Progress",
                    score: null,
                    time: "1 day ago",
                  },
                  {
                    name: "Alex Rodriguez",
                    email: "alex.rodriguez@example.com",
                    role: "Fullstack Challenge",
                    status: "Completed",
                    score: "88%",
                    time: "3 days ago",
                  },
                ].map((candidate, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted px-4 py-2 rounded-md gap-2"
                  >
                    <div>
                      <p className="font-medium text-sm">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      <p className="text-xs text-muted-foreground">{candidate.role}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge
                        className={`${
                          candidate.status === "Completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
                        } text-xs`}
                      >
                        {candidate.status}
                      </Badge>
                      {candidate.status === "Completed" && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Score:</span> {candidate.score}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">{candidate.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            
            <Card className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Upcoming Interviews</CardTitle>
                <CardDescription>Scheduled interviews for this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Emma Wilson', date: 'Today, 4PM', label: 'Technical Interview' },
                  { name: 'David Amedi', date: 'Tomorrow, 10AM', label: 'System Design' },
                  { name: 'James Kimani', date: 'Saturday, 9AM', label: 'Code Review' },
                ].map((interview, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted px-4 py-2 rounded-md gap-2"
                  >
                    <div>
                      <p className="font-medium text-sm">{interview.name}</p>
                      <p className="text-xs text-muted-foreground">{interview.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
                      <Link to="/signup">{interview.label}</Link>
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        
          <Card className="mx-auto w-full transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Assessment Performance Overview</CardTitle>
              <CardDescription>
                Performance metrics across all active assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: 'Frontend Assessments', value: '85%' },
                { title: 'Backend Assessments', value: '88%' },
                { title: 'Full Stack Challenges', value: '72%' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground">{item.value} avg</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: item.value }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );


}

