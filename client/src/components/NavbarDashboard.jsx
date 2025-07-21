"use client"

import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useState } from 'react';
import ThemeToggle  from './ThemeToggle'
import { Code2 } from 'lucide-react';


function NavbarDashboard(){
 return (
    <nav className="w-full bg-white-500 text-black px-3 flex justify-between mt-3 ">
       <Link to = "/" className='flex items-center space-x-2 '> 
        <Code2 className='h-8  w-8 text-primary' />
         <span className='text-xl font-bold text-foreground'>SmartRecruiter</span>
       </Link>
        <div className = "space-x-10">
            <Link to = "/">Home</Link>
            <Link to = "/login">Login</Link>
        </div>
        <ThemeToggle />
     
    </nav>
  );
}


export default NavbarDashboard;