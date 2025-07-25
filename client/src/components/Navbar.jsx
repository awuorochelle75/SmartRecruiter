"use client"

import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { Code2, Menu, X } from 'lucide-react'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-background text-foreground shadow-md p-5 flex justify-between items-center relative">
      
     
      <Link to="/" className="flex items-center space-x-2">
        <Code2 className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">SmartRecruiter</span>
      </Link>

      
      <div className="hidden md:flex space-x-6 text-sm font-medium">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <Link to="/pricing" className="hover:text-primary transition">Pricing</Link>
        <Link to="/about" className="hover:text-primary transition">About</Link>
      </div>

      
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/login" className="hover:text-primary transition">Login</Link>
        <Link to="/signup">
          <Button size="sm">Sign Up</Button>
        </Link>
        <ThemeToggle />
      </div>

      
      <div className="md:hidden flex items-center space-x-4">
        <ThemeToggle />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

     
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-t border-border flex flex-col space-y-4 px-5 py-4 text-sm font-medium md:hidden z-50">
          <Link to="/" className="hover:text-primary transition" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/pricing" className="hover:text-primary transition" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          <Link to="/about" className="hover:text-primary transition" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link to="/login" className="hover:text-primary transition" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
            <Button size="sm" className="w-full">Sign Up</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
