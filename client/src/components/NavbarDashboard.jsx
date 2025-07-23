"use client"

import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useState } from 'react';
import ThemeToggle  from './ThemeToggle'
import { Code2 } from 'lucide-react';


function NavbarDashboard(){
 return (
    <nav className="w-full bg-white-500 text-black px-3 flex justify-between mt-3 ">
    <div className=" w-[28rem]">
  <input
    type="text"
    placeholder="Search..."
    className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm  "
  />
</div>


        <div className = "space-x-10">
            <Link to = "/">Home</Link>
            <Link to = "/login">Login</Link>
        </div>
        <ThemeToggle />
     
    </nav>
  );
}


export default NavbarDashboard;