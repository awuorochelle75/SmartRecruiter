import { useState } from 'react';
import DashboardNavbar from '../../components/DashboardNavbar';
import NavbarDashboard from '../../components/DashboardNavbar';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Eye, MoreVertical } from 'lucide-react';
import { Progress } from '../../components/ui/progress';

export default function ResultsAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const myAssessmentResultsData = [
    {
      id: 1,
      avatar: "/avatars/rochelle.jpg",
      name: "Rochelle Awuor",
      country: "Nairobi, Kenya",
      assessment: "Frontend Developer Assessment",
      skills: "React, JavaScript",
      score: 87,
      status: "shortlisted",
      completedDate: "July 21, 2025",
      timespent: "45mins"
    },
  ];

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

        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted">
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-semibold">Results</h1>
              <p className="text-sm text-muted-foreground mt-2">
                View and analyze assessment results and candidate performance.
              </p>
            </div>
            <Button asChild size="sm" className="text-sm px-6">
              <Link to="/createassessment">Export Results</Link>
            </Button>
          </div>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {[
              { label: 'Average Score', value: '4' },
              { label: 'Completion Rate', value: '1' },
              { label: 'Average Time', value: '52 min' },
              { label: 'Pass Rate', value: '63%' },
            ].map((stat, idx) => (
              <Card
                key={idx}
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

      
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
            <input
              type="text"
              placeholder="Search assessments..."
              className="flex-grow border border-border bg-background rounded-md px-4 py-2 text-sm"
            />
            <select className="border border-border bg-background text-foreground rounded-md px-3 py-2 text-sm w-full sm:w-auto">
              <option value="">All status</option>
              <option value="active">Shortlisted</option>
              <option value="draft">Unsuccessful</option>
            </select>
          </div>

        
          <Card className="bg-card border border-border mt-6">
            <CardHeader>
              <CardTitle className="text-lg">My Assessment Results</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Detailed results for your completed assessments
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted">
                  <tr>
                    {["Candidate", "Assessment", "Score", "Status", "Completed", "Time Spent", "Actions"].map(header => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myAssessmentResultsData.map((candidate) => (
                    <tr key={candidate.id}>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.country}</p>
                          </div>
                        </div>
                      </td>

                     
                      <td className="px-6 py-4 whitespace-nowrap">{candidate.assessment}</td>

                     
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{candidate.score}%</span>
                          <Progress
                            value={candidate.score}
                            className="w-24 h-2 bg-muted"
                            indicatorClassName="bg-primary"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 border-green-600 bg-green-50/20 dark:bg-green-900/20"
                        >
                          {candidate.status}
                        </Badge>
                      </td>

                     
                      <td className="px-6 py-4 whitespace-nowrap">{candidate.completedDate}</td>

                      
                      <td className="px-6 py-4 whitespace-nowrap">{candidate.timespent}</td>

                      
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
