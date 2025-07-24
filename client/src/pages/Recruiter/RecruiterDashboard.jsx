import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'


export default function RecruiterDashboard(){
  return(
   <div className='flex h-screen'>
   <div className='w-64' >
     <SidebarRecruiter />
    </div>

    <div className="flex-1 flex flex-col">
    <div className="h-16 bg-white shadow">
      <NavbarDashboard />
    </div>
     <div className="flex-1 p-4 bg-gray-50 overflow-auto">
      <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold">Recruiter Dashboard</h1>
      <p className="text-sm mt-2">
        Manage your assessments and track candidate performance.
      </p>
    </div>
    <div className="flex gap-4">
      <Button asChild size="sm" className="text-sm px-6">
        <Link to="/createassessment">
          <span className="flex items-center">Create assessment</span>
        </Link>
      </Button>

      <Button asChild size="sm" variant="outline" className="text-sm px-2">
        <Link to="/invite candidates">
          <span className="flex items-center">Invite candidates</span>
        </Link>
      </Button>
    </div>
  </div>

      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-10 mt-10 mb-10">
            <Card className="bg-white border border-zinc-300 rounded p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Active Assessments</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                         12
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-300 rounded p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Total Candidates</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                   248
                </CardContent>
              </Card>

                <Card className="bg-white border border-zinc-300 rounded p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Completion Rate</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                  87%
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-300 rounded p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700  font-normal text-lg">Average Score</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                    78.5
                </CardContent>
              </Card>  
           </div>
         


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-10 mb-10">
           <Card className="bg-white border border-zinc-300 rounded p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
            <CardHeader>
             <CardTitle className='text-xl'>Recent Candidate Activity</CardTitle>
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
        className="flex items-center justify-between bg-zinc-100 px-4 py-2 rounded-md"
      >
    
        <div>
          <p className="font-semibold text-sm">{candidate.name}</p>
          <p className="text-xs text-gray-500">{candidate.email}</p>
          <p className="text-xs text-gray-500">{candidate.role}</p>
        </div>

        <div className="text-right">
          <Badge
            className={`mb-1 ${
              candidate.status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {candidate.status}
          </Badge>
          {candidate.status === "Completed" && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Score:</span> {candidate.score}
            </p>
          )}
          <p className="text-xs text-gray-400">{candidate.time}</p>
        </div>
      </div>
    ))}
  </CardContent>
</Card>


 <Card className="bg-white border border-zinc-300 rounded p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
  <CardHeader>
    <CardTitle className='text-xl'>Upcoming Interviews</CardTitle>
    <CardDescription>Scheduled interviews for this week</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {[
      { name: 'Emma Wilson', date: 'Today, 4PM', label: 'Technical Interview' },
      { name: 'David Amedi', date: 'Tomorrow, 10AM', label: 'System Design' },
      { name: 'James Kimani', date: 'Saturday, 9AM', label: 'Code Review' },
    ].map((interview, i) => (
      <div key={i} className="flex items-center justify-between bg-zinc-100 px-4 py-2 rounded-md">
        <div>
          <p className="font-semibold text-sm">{interview.name}</p>
          <p className="text-xs text-gray-500">{interview.date}</p>
        </div>
        <Badge size="sm" variant="outline" className="text-xs rounded-full ">
          <Link to="/signup">{interview.label}</Link>
        </Badge>
      </div>
    ))}
  </CardContent>
</Card>

</div>


<Card className="mx-4 md:mx-10 mb-10 bg-white border border-zinc-200 shadow-md rounded">
  <CardHeader>
    <CardTitle className='text-xl'>Assessment Performance Overview</CardTitle>
    <CardDescription>Performance metrics across all active assessments</CardDescription>
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
          <span className="text-sm text-gray-600">{item.value} avg</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
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