import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'

export default function Candidates() {
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
      <h1 className="text-xl font-semibold">Candidates</h1>
      <p className="text-sm mt-2">
        Manage and evaluate your candidate pipeline.
      </p>
    </div>
    <div className="flex gap-4">
      <Button asChild size="sm" className="text-sm px-6">
        <Link to="/createassessment">
          <span className="flex items-center">Export Candidates</span>
        </Link>
      </Button>
    </div>
    
    </div>
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 px-2 md:px-10 mt-10 mb-10">
            <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Total Candidates</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                         4
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Shortlisted</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                   1
                </CardContent>
              </Card>

                <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Interviewed</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                  1
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700  font-normal text-lg">Average Score</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                    63%
                </CardContent>
              </Card>  
           </div>

<div className="flex items-center justify-between mt-4">
 
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

         

    </div>
    </div>
    </div>
   
    );
}