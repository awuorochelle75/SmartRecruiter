import SidebarRecruiter from '../../components/SidebarRecruiter';
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,} from '../../components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

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
  return (
    <div className="flex h-screen">
      <div className="w-64 hidden md:block">
        <SidebarRecruiter />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white shadow">
          <NavbarDashboard />
        </div>

        <div className="flex-1 p-4 bg-gray-50 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-semibold">Assessments</h1>
              <p className="text-sm mt-2">Create and manage your technical assessment</p>
            </div>
            <Button asChild size="sm" className="text-sm px-6">
              <Link to="/createassessment">Create assessment</Link>
            </Button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
            <input
              type="text"
              placeholder="Search assessments..."
              className="flex-grow border border-gray-300 rounded-md px-4 py-2 text-sm"
            />
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-auto">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Completed</option>
            </select>
          </div>

          {/* Assessment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
            {assessments.map((item, index) => (
              <Card
                key={index}
                className="bg-white border border-zinc-300 rounded p-3 transition duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-lg hover:z-[999]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                      <CardDescription className="text-xs mt-1 text-gray-600">
                        {item.description}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                    <div className="flex flex-col items-end gap-1">
  {/* Dropdown Menu on top */}
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

  {/* Badge below the three-dot menu */}
  <Badge
    className={`bg-${item.badgeColor}-100 text-${item.badgeColor}-700 text-xs px-2 py-1`}
  >
    {item.status}
  </Badge>
</div>

                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 mt-1">
                  <div className="text-sm font-medium text-gray-700">
                    Candidates: {item.candidates}
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
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
