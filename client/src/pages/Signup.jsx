import React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle,  CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import NavbarDashboard from "../components/NavbarDashboard";
import { Code2 } from 'lucide-react';
import Footer from "./Footer"


function Signup(){
    return(
      <div>
      <NavbarDashboard />
       <div className=" flex flex-col items-center  gap-2 px-4 mt-4  bg-gray-200 min-h-screen  ">
        <Link to = "/" className='flex items-center space-x-2 mt-5 '> 
        <Code2 className='h-8  w-8 text-primary ' />
         <span className='text-xl font-bold text-foreground '>SmartRecruiter</span>
       </Link>
        <h2 className="font-bold text-lg ">Create Your Account </h2>
        <p className="text-sm font-light ">Join thousands of proffesionals using SmartRecruiter</p>
        <Card className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-10  w-[50%] mb-6">
         <CardHeader>
            <CardTitle className = "text-black font-bold text-xl">Sign Up </CardTitle>
            <h1>Enter your credentials to access your account</h1>
            <p> I am a...</p>
         </CardHeader>
          <CardContent>
              <form className="flex flex-col gap-4">
               
                <div className="flex gap-4">
                 <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                 <input type="radio" name="role" value="recruiter" className="primary" />
                   Recruiter
                 </label>

                 <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                 <input type="radio" name="role" value="interviewee" className="primary" />
                   Interviewee
                 </label>
               </div>

            
             <div className="flex gap-4 items-start mt-2">
               <label className="text-sm">
                  First Name<br />
                   <input
                    type="text"
                    placeholder="Enter first name"
                     className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                    />
               </label>
               <label className="text-sm">
                Last Name<br />
                 <input
                  type="text"
                  placeholder="Enter last name"
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                   />
                  </label>
                </div>

            
          <div className="flex flex-col mt-2">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
        />
      </div>


         <div className="flex gap-4 items-start mt-2">
               <label className="text-sm">
                  Password<br />
                   <input
                    type="text"
                    placeholder="create password"
                     className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                    />
               </label>
               <label className="text-sm">
                Confirm password<br />
                 <input
                  type="text"
                  placeholder="confirm your password"
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm"
                   />
                  </label>
                </div>

                   <div className="flex flex-col mt-2">
                   <label className="text-sm font-medium text-gray-700">Bio {'{ProfessionalSummary}'} </label>
                   <input
                   type="email"
                   placeholder="Tell us about your skills and experience"
                   className="border border-gray-300 rounded-md px-4 py-2 mt-2 h-24 text-sm"
                   />
                </div>

               
                 <Button asChild size="lg" className="text-lg px-8 mt-2 ">
                             <Link to="/signup">
                              <span className='inline-flex items-center '>Create Account</span>
                             </Link>
                           </Button>

      
    
    </form>
          </CardContent>
        </Card>

       </div>
        <Footer />
       </div>
     
       

     

       
      
      
    )
}
export default Signup;