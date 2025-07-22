import SidebarRecruiter from '../../components/SidebarRecruiter'
import Navbar from '../../components/Navbar';

export default function RecruiterDashboard(){
  return(
   <div className='flex h-screen'>
   <div className='w-64' >
     <SidebarRecruiter />
    </div>

    <div className="flex-1 flex flex-col">
    <div className="h-16 bg-white shadow">
      <Navbar />
    </div>

    <div className="flex-1 p-4 bg-gray-50 overflow-auto">
      <h1 className="text-xl font-semibold">Recruiter Dashboard</h1>
    </div>
  </div>
    </div>
  );
}