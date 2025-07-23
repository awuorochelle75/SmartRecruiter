import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'

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
</div>

  </div>
    </div>
  );
}