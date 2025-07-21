"use client"

import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useState } from 'react';
import ThemeToggle  from './ThemeToggle'
import { Code2 } from 'lucide-react';


function Navbar(){
 return (
    <nav className="w-full bg-white-500 text-black p-5 flex justify-between ">
       <Link to = "/" className='flex items-center space-x-2 '> 
        <Code2 className='h-8  w-8 text-primary' />
         <span className='text-xl font-bold text-foreground'>SmartRecruiter</span>
       </Link>
        <div className = "space-x-10">
            <Link to = "/">Home</Link>
            <Link to = "/pricing">Pricing</Link>
            <Link to = "/about">About</Link>
             
        </div>
        <div className='space-x-10'>
            <Link to = "/login">Login</Link>
             <Link to = "/signup">SignUp</Link>
        </div>
        <ThemeToggle />
     
    </nav>
  );
}


export default Navbar;