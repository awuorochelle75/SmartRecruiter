import DashboardNavbar from '../../components/DashboardNavbar'
import NavbarDashboard from '../../components/DashboardNavbar';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export default function Interview() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
    
      <div className="hidden md:block w-64">
        <DashboardNavbar />
      </div>

   
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-background shadow-md h-full">
            <DashboardNavbar />
          </div>
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
      
        <div className="h-16 bg-background border-b border-border shadow-sm flex items-center justify-between px-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <MoreVertical className="h-6 w-6" />
          </button>
          <NavbarDashboard />
        </div>

      
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted">
         
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-semibold">My Results</h1>
              <p className="text-sm text-muted-foreground mt-2">
                View and analyze your assessment results performance.
              </p>
            </div>
            <Button asChild size="sm" className="text-sm px-6">
              <Link to="/createassessment">Export Results</Link>
            </Button>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {[
              { label: "Today's Interview", value: '0' },
              { label: 'This Week', value: '0' },
              { label: 'Completed', value: '1' },
              { label: 'Success Rate', value: '85%' },
            ].map((stat, i) => (
              <Card
                key={i}
                className="bg-card border border-border rounded p-4 transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-bold">{stat.value}</CardContent>
              </Card>
            ))}
          </div>

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="bg-card border border-border rounded transition hover:scale-[1.02] hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground italic py-10">
                No interviews scheduled for this date
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded transition hover:scale-[1.02] hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Upcoming Interviews</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Next scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground italic py-10" />
            </Card>
          </div>

          
          <Card className="mt-8 bg-card border border-border rounded">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All Interviews</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Detailed results for your completed assessments.
              </CardDescription>
            </CardHeader>

         
            <Card className="mx-0 md:mx-6 mb-6 bg-background border border-border shadow-sm rounded">
              <CardHeader className="flex justify-between items-start">
                <div className="flex gap-4 items-start w-full">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/profile.jpg" alt="Candidate" />
                    <AvatarFallback>RA</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">Rochelle Awuor</span>
                    <span className="text-sm text-muted-foreground">Frontend Developer</span>
                    <span className="text-sm text-muted-foreground">rochellea@gmail.com</span>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-xs text-blue-700 border-blue-500 bg-blue-50 dark:bg-blue-900/20">Technical Interview</Badge>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">Notes: focus on React hooks and state management</p>
                  </div>

                  <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Duration: 60 mins</span>
                      <span className="text-sm font-medium">Interviewer: Tom Orland</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-4">
                    <div className="flex flex-col items-end">
                      <Badge variant="outline" className="text-xs text-green-700 border-green-500 bg-green-100 dark:bg-green-900/20">Scheduled</Badge>
                      <span className="text-xs text-muted-foreground mt-1">July 25, 2025</span>
                    </div>
                    <div className="mt-auto">
                      <Button className="text-xs bg-primary hover:bg-primary/90 text-white mt-12">
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            
            <Card className="mx-0 md:mx-6 mb-6 bg-background border border-border shadow-sm rounded">
              <CardHeader className="flex justify-between items-start">
                <div className="flex gap-4 items-start w-full">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/profile.jpg" alt="Candidate" />
                    <AvatarFallback>JK</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">James Kiplimo</span>
                    <span className="text-sm text-muted-foreground">Senior Software Engineer</span>
                    <span className="text-sm text-muted-foreground">jkiplimo@gmail.com</span>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-xs text-blue-700 border-blue-500 bg-blue-50 dark:bg-blue-900/20">Technical Interview</Badge>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">Notes: focus on React hooks and state management</p>
                  </div>

                  <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Duration: 60 mins</span>
                      <span className="text-sm font-medium">Interviewer: Derrick Ochieng</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-4">
                    <div className="flex flex-col items-end">
                      <Badge variant="outline" className="text-xs text-green-700 border-green-500 bg-green-100 dark:bg-green-900/20">Scheduled</Badge>
                      <span className="text-xs text-muted-foreground mt-1">Jun 30, 2025</span>
                    </div>
                    <div className="mt-auto">
                      <Button className="text-xs bg-primary hover:bg-primary/90 text-white mt-12">
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Card>
        </div>
      </div>
    </div>
  );
}
