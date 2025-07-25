"use client";

import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { Code2 } from 'lucide-react';

function Navbar() {
  return (
    <nav className="w-full bg-background text-foreground shadow-md p-5 flex justify-between items-center">
      
      <Link to="/" className="flex items-center space-x-2">
        <Code2 className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">SmartRecruiter</span>
      </Link>

     
      <div className="hidden md:flex space-x-6 text-sm font-medium">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <Link to="/pricing" className="hover:text-primary transition">Pricing</Link>
        <Link to="/about" className="hover:text-primary transition">About</Link>
      </div>

      
      <div className="flex items-center space-x-6">
        <Link to="/login" className="hover:text-primary transition">Login</Link>
        <Link to="/signup">
          <Button size="sm">Sign Up</Button>
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
