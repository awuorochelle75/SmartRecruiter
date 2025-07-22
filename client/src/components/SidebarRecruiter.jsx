import React from 'react';
import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';


export default function SidebarRecruiter(){
  return (
    <div className="w-64 h-screen bg-white shadow-lg fixed top-0 left-0 p-6">
      <div className="flex items-center mb-4">
        
         <Link to = "/" className='flex items-center space-x-2 mt-2 '> 
         <Code2 className='h-6  w-6 text-primary  ' />
         <span className='text-sm font-bold text-foreground  '>SmartRecruiter</span>
       </Link>
      </div>

     <hr className="border-t border-gray-300 mb-4 " /> 

      <ul className="space-y-6 text-gray-700 text-md ">
        <li>
          <Link to="/recruiter/dashboard"  >
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/recruiter/create-assessment" >
            Create Assessment
          </Link>
        </li>
        <li>
          <Link to="/recruiter/assessments" >
            Assessment
          </Link>
        </li>
        <li>
          <Link to="/recruiter/candidates" >
            Candidates
          </Link>
        </li>
          <li>
          <Link to="/recruiter/results-analytics" >
            Result & Analytics
          </Link>
        </li>
          <li>
          <Link to="/recruiter/interviews" >
            Interviews
          </Link>
        </li>
           <li>
          <Link to="/recruiter/messages" >
            Messages
          </Link>
        </li>
          <li>
          <Link to="/recruiter/profile">
            Profile
          </Link>
        </li>
          <li>
          <Link to="/recruiter/settings" >
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};


