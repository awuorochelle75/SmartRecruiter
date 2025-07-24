import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'


export default function Assessment(){
    return (
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
          <h1 className="text-xl font-semibold">Assessments</h1>
          <p className="text-sm mt-2">
            Create and manage your technical assessment
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild size="sm" className="text-sm px-6">
            <Link to="/createassessment">
              <span className="flex items-center">Create assessment</span>
            </Link>
          </Button>
        </div>
      </div>
       
<div className="flex items-center justify-between mt-6">
 
  <input
    type="text"
    placeholder="Search assessments..."
    className="flex-grow max-w-5xl border border-gray-300 rounded-md px-4 py-2 text-sm "
  />

  
  <select
    className="ml-4 border border-gray-300 rounded-md px-3 py-2 text-sm "
  >
    <option value="">All status</option>
    <option value="active">Active</option>
    <option value="draft">Draft</option>
    <option value="archived">Completed</option>
  </select>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-10 mb-10">
       <Card className="bg-white border border-zinc-300 rounded p-3 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-lg hover:z-[999] relative max-w-md w-full mt-4">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base font-semibold">Frontend Developer Assessment</CardTitle>
      <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">Active</Badge>
    </div>
    <CardDescription className="text-xs mt-1 text-gray-600">
      React, JavaScript and CSS Fundamentals
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-2 mt-1">
   
    <div className="text-sm font-medium text-gray-700">Candidates: 3</div>

    
    <div className="flex justify-between text-xs text-gray-500">
      <div>
        <p><span className="font-semibold">Created:</span> Jul 21, 2025</p>
        <p><span className="font-semibold">Deadline:</span> Jul 28, 2025</p>
      </div>
      <p className="text-right"><span className="font-semibold">Duration:</span> 45 mins</p>
    </div>

  
    <div className="flex justify-between pt-2">
      <Button  className="text-xs px-3 py-4">View Results</Button>
      <Button variant="outline" className="text-xs px-3 py-3">Send Invites</Button>
    </div>
  </CardContent>
</Card>


 <Card className="bg-white border border-zinc-300 rounded p-3 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-lg hover:z-[999] relative max-w-md w-full mt-4">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base font-semibold">Backend Engineer Test</CardTitle>
      <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1">Draft</Badge>
    </div>
    <CardDescription className="text-xs mt-1 text-gray-600">
      Node.js, Database design, API development
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-2 mt-1">
   
    <div className="text-sm font-medium text-gray-700">Candidates: 0</div>

    
    <div className="flex justify-between text-xs text-gray-500">
      <div>
        <p><span className="font-semibold">Created:</span> May 21, 2025</p>
        <p><span className="font-semibold">Deadline:</span> May 28, 2025</p>
      </div>
      <p className="text-right"><span className="font-semibold">Duration:</span> 90 mins</p>
    </div>

  
    <div className="flex justify-between pt-2">
      <Button  className="text-xs px-3 py-4">View Results</Button>
      <Button variant="outline" className="text-xs px-3 py-3">Send Invites</Button>
    </div>
  </CardContent>
</Card>

 <Card className="bg-white border border-zinc-300 rounded p-3 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-lg hover:z-[999] relative max-w-md w-full mt-4">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base font-semibold">Full Stack Challenge</CardTitle>
      <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">Completed</Badge>
    </div>
    <CardDescription className="text-xs mt-1 text-gray-600">
      Complete web application development
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-2 mt-1">
   
    <div className="text-sm font-medium text-gray-700">Candidates: 15</div>

    
    <div className="flex justify-between text-xs text-gray-500">
      <div>
        <p><span className="font-semibold">Created:</span> April 21, 2025</p>
        <p><span className="font-semibold">Deadline:</span> May 28, 2025</p>
      </div>
      <p className="text-right"><span className="font-semibold">Duration:</span> 120 mins</p>
    </div>

  
    <div className="flex justify-between pt-2">
      <Button  className="text-xs px-3 py-4">View Results</Button>
      <Button variant="outline" className="text-xs px-3 py-3">Send Invites</Button>
    </div>
  </CardContent>
</Card>
</div>


        </div>
      </div>
        </div>
      
    )
}