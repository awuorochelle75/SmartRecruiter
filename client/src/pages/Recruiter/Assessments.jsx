import { useState } from "react";
import DashboardNavbar from '../../components/DashboardNavbar';
import NavbarDashboard from '../../components/DashboardNavbar';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import {Card,CardHeader,CardTitle,CardDescription,CardContent,} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,} from '../../components/ui/dropdown-menu';
import { MoreHorizontal, MoreVertical } from 'lucide-react';

const assessments = [
  {
    title: 'Frontend Developer Assessment',
    status: 'Active',
    badgeColor: 'green',
    description: 'React, JavaScript and CSS Fundamentals',
    candidates: 3,
    created: 'Jul 21, 2025',
    deadline: 'Jul 28, 2025',
    duration: '45 mins',
  },
  {
    title: 'Backend Engineer Test',
    status: 'Draft',
    badgeColor: 'yellow',
    description: 'Node.js, Database design, API development',
    candidates: 0,
    created: 'May 21, 2025',
    deadline: 'May 28, 2025',
    duration: '90 mins',
  },
  {
    title: 'Full Stack Challenge',
    status: 'Completed',
    badgeColor: 'blue',
    description: 'Complete web application development',
    candidates: 15,
    created: 'April 21, 2025',
    deadline: 'May 28, 2025',
    duration: '120 mins',
  },
];

export default function Assessment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
     
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

        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-semibold">Assessments</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Create and manage your technical assessment
              </p>
            </div>
            <Button asChild size="sm" className="text-sm px-6">
              <Link to="/createassessment">Create assessment</Link>
            </Button>
          </div>

         
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
            <input
              type="text"
              placeholder="Search assessments..."
              className="flex-grow border border-border bg-background rounded-md px-4 py-2 text-sm"
            />
            <select className="border border-border bg-background text-foreground rounded-md px-3 py-2 text-sm w-full sm:w-auto">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Completed</option>
            </select>
          </div>

       
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
            {assessments.map((item, index) => (
              <Card
                key={index}
                className="bg-card border border-border rounded p-3 transition duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-lg hover:z-[999]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                      <CardDescription className="text-xs mt-1 text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                     
                      <Badge className={`bg-${item.badgeColor}-100 text-${item.badgeColor}-700 text-xs px-2 py-1`}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 mt-1">
                  <div className="text-sm font-medium text-foreground">
                    Candidates: {item.candidates}
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>
                      <p>
                        <span className="font-semibold">Created:</span> {item.created}
                      </p>
                      <p>
                        <span className="font-semibold">Deadline:</span> {item.deadline}
                      </p>
                    </div>
                    <p className="text-right">
                      <span className="font-semibold">Duration:</span> {item.duration}
                    </p>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button className="text-xs px-3 py-2">View Results</Button>
                    <Button variant="outline" className="text-xs px-3 py-2">
                      Send Invites
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
