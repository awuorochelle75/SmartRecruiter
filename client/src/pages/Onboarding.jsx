import React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle,  CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Navbar from "../components/Navbar";
import { Code2 } from 'lucide-react';
import SidebarRecruiter from '../components/SidebarRecruiter'
import Footer from "./Footer"

export default function Onboarding(){
    return (
     <div>
         <Navbar />
         <SidebarRecruiter />
          <div className=" flex flex-col items-center  gap-2 px-4 mt-4  bg-gray-200 min-h-screen  ">
           <Link to = "/" className='flex items-center space-x-2 mt-5 '> 
           <Code2 className='h-8  w-8 text-primary ' />
            <span className='text-xl font-bold text-foreground '>SmartRecruiter</span>
          </Link>
           <h2 className="font-bold text-lg ">Tell us about your interests. </h2>
           <p className="text-sm font-light ">Help us tailor your experience by selecting topics you're interested in.</p>
           <Card className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-10  w-[75%] mb-6">
            <CardHeader>
               <CardTitle className = "text-black font-bold text-xl">Select Your Skills & Interests </CardTitle>
               <p> Choose at least 3 topics that align with your professional goals.</p>
            </CardHeader>
             <CardContent>
                 <form className="flex flex-col gap-4">
                  
                   <div className="flex gap-4">
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="recruiter" className="primary" />
                      Javascript
                    </label>
   
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Python
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Java
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      C++
                    </label>
                  </div>

                    <div className="flex gap-4 mt-4">
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="recruiter" className="primary" />
                      Go
                    </label>
   
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Rust
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      React
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Angular
                    </label>
                  </div>
   
                     <div className="flex gap-4 mt-4">
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="recruiter" className="primary" />
                      Vue.js
                    </label>
   
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Node.js
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Django
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Spring Boot
                    </label>
                  </div>

                    
                     <div className="flex gap-4 mt-4">
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="recruiter" className="primary" />
                      Machine Learning
                    </label>
   
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Data Science
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Web Development
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      Mobile Development
                    </label>
                  </div>


                      
                     <div className="flex gap-4 mt-4">
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="recruiter" className="primary" />
                      Cloud Computing
                    </label>
   
                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      DevOps
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      CyberSecurity
                    </label>

                    <label className="flex items-center gap-2 border border-gray-300 rounded-md px-14 py-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value="interviewee" className="primary" />
                      UI/UX Design
                    </label>
                  </div>
   
               
   
               
                  
                    <Button asChild size="lg" className="text-lg px-8 mt-2 ">
                                <Link to="/onboarding">
                                 <span className='inline-flex items-center '>Continue</span>
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

