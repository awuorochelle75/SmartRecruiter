import SidebarRecruiter from '../../components/SidebarRecruiter';
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function RecruiterDashboard() {
  return (
    <div className="flex h-screen bg-background text-foreground dark:bg-background dark:text-foreground">
      {/* Sidebar */}
      <div className="w-64 hidden md:block">
        <SidebarRecruiter />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="h-16 bg-background border-b border-border shadow-sm">
          <NavbarDashboard />
        </div>

        {/* Dashboard Body */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted dark:bg-muted space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your assessments and track candidate performance.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button asChild size="sm">
                <Link to="/createassessment">Create assessment</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/invitecandidates">Invite candidates</Link>
              </Button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Active Assessments', value: '12' },
              { title: 'Total Candidates', value: '248' },
              { title: 'Completion Rate', value: '87%' },
              { title: 'Average Score', value: '78.5' },
            ].map((stat, i) => (
              <Card key={i} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-primary text-md font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{stat.value}</CardContent>
              </Card>
            ))}
          </div>

          {/* Activity & Interviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Candidate Activity */}
            <Card className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Recent Candidate Activity</CardTitle>
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
                    className="flex items-center justify-between bg-muted px-4 py-2 rounded-md"
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
                        }`}
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

            {/* Upcoming Interviews */}
            <Card className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Upcoming Interviews</CardTitle>
                <CardDescription>Scheduled interviews for this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Emma Wilson', date: 'Today, 4PM', label: 'Technical Interview' },
                  { name: 'David Amedi', date: 'Tomorrow, 10AM', label: 'System Design' },
                  { name: 'James Kimani', date: 'Saturday, 9AM', label: 'Code Review' },
                ].map((interview, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted px-4 py-2 rounded-md">
                    <div>
                      <p className="font-medium text-sm">{interview.name}</p>
                      <p className="text-xs text-muted-foreground">{interview.date}</p>
                    </div>
                    <Badge size="sm" variant="outline" className="text-xs rounded-full">
                      <Link to="/signup">{interview.label}</Link>
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card className="mx-auto max-w-6xl transition hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Assessment Performance Overview</CardTitle>
              <CardDescription>
                Performance metrics across all active assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
