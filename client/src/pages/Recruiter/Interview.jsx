import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'


export default function Interview() {
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
      <h1 className="text-xl font-semibold">My Results</h1>
      <p className="text-sm mt-2">
        View and analyze your assessment results performance.
      </p>
    </div>
    <div className="flex gap-4">
      <Button asChild size="sm" className="text-sm px-6">
        <Link to="/createassessment">
          <span className="flex items-center">Export Results</span>
        </Link>
      </Button>

    </div>
  </div>

      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-10 mt-10 mb-10">
            <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Today's Interview</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                         0
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">This Week</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                   0
                </CardContent>
              </Card>

                <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700 font-normal text-lg">Completed</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                  1
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">

                <CardHeader>
                 <CardTitle className="text-accent-700  font-normal text-lg">Success Rate</CardTitle>
                </CardHeader>
                  <CardContent className='font-bold'>
                    85%
                </CardContent>
              </Card>  
           </div>
         


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-10 mb-10">
           <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
            <CardHeader>
             <CardTitle className='text-xl'>Today's Schedule</CardTitle>
            </CardHeader>
             <CardContent className="text-center text-gray-400 italic py-10">
                No interviews scheduled for this date
            </CardContent>

        </Card>


 <Card className="bg-white border border-zinc-300 rounded-xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
  <CardHeader>
    <CardTitle className='text-xl'>Upcoming Interviews</CardTitle>
    <CardDescription>Next scheduled interviews</CardDescription>
  </CardHeader>
  <CardContent className="text-center text-gray-400 italic py-10">
  
  </CardContent>
</Card>

</div>

<Card>
 <CardHeader>
    <CardTitle className='text-xl'>
       All Interviews
    </CardTitle>
     <CardDescription> Detailed results for your completed assessments .</CardDescription>
 </CardHeader>
 
<Card className="mx-4 md:mx-10 mb-10 bg-white border border-zinc-200 shadow-md rounded-2xl mt-6">
  <CardHeader className="flex justify-between items-start">
    
    <div className="flex gap-4 items-start w-full">
      <Avatar className="w-12 h-12">
        <AvatarImage src="/profile.jpg" alt="Candidate" />
        <AvatarFallback>RA</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-base font-semibold text-gray-900">Rochelle Awuor</span>
        <span className="text-sm text-gray-600 ">Frontend Developer</span>
        <span className="text-sm text-gray-500">rochellea@gmail.com</span>
        <div className="mt-4">
          <Badge variant="outline" className="text-xs text-blue-700 border-blue-500 bg-blue-50 dark:bg-blue-900/20"> Techical Interview</Badge>
        </div>
        <p className="mt-4 text-xs text-gray-500">Notes: focus on React hooks and state management</p>
      </div>

      <div className="flex-1 flex justify-center items-center">
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-gray-700 mt-4">Duration: 60 mins</span>
    <span className="text-sm font-medium text-gray-700 mt-4">Interviewer: Tom Orland</span>
  </div>
</div>

     
      <div className="flex flex-col items-end justify-between h-full gap-4">
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="text-xs text-green-700 border-green-500 bg-green-100">Scheduled</Badge>
          <span className="text-xs text-gray-500 mt-1">July 25, 2025</span>
        </div>
        <div className="mt-auto">
          <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer mt-12">Join Meeting</Badge>
        </div>
      </div>
    </div>
  </CardHeader>
</Card>


<Card className="mx-4 md:mx-10 mb-10 bg-white border border-zinc-200 shadow-md rounded-2xl mt-6">
  <CardHeader className="flex justify-between items-start">
  
    <div className="flex gap-4 items-start w-full">
      <Avatar className="w-12 h-12">
        <AvatarImage src="/profile.jpg" alt="Candidate" />
        <AvatarFallback>JK</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-base font-semibold text-gray-900">James Kiplimo</span>
        <span className="text-sm text-gray-600 ">Senior Software Engineer</span>
        <span className="text-sm text-gray-500">jkiplimo@gmail.com</span>
        <div className="mt-4">
          <Badge variant="outline" className="text-xs text-blue-700 border-blue-500 bg-blue-50 dark:bg-blue-900/20"> Techical Interview</Badge>
        </div>
        <p className="mt-4 text-xs text-gray-500">Notes: focus on React hooks and state management</p>
      </div>

    
      <div className="flex-1 flex justify-center items-center">
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-gray-700 mt-4">Duration: 60 mins</span>
    <span className="text-sm font-medium text-gray-700 mt-4">Interviewer: Derrick Ochieng</span>
  </div>
</div>

        
         
  

    
      <div className="flex flex-col items-end justify-between h-full gap-4">
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="text-xs text-green-700 border-green-500 bg-green-100">Scheduled</Badge>
          <span className="text-xs text-gray-500 mt-1">Jun 30, 2025</span>
        </div>
        <div className="mt-auto">
          <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer mt-12">Join Meeting</Badge>
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