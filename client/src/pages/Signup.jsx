import React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import NavbarDashboard from "../components/NavbarDashboard";
import { Code2 } from 'lucide-react';
import Footer from "./Footer";

function Signup() {
  return (
    <div className="bg-muted min-h-screen text-foreground">
      <NavbarDashboard />

      <div className="flex flex-col items-center gap-2 px-4 mt-4">
        
        <Link to="/" className="flex items-center space-x-2 mt-5">
          <Code2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">SmartRecruiter</span>
        </Link>

        <h2 className="font-bold text-lg">Create Your Account</h2>
        <p className="text-sm text-muted-foreground font-light text-center">
          Join thousands of professionals using SmartRecruiter
        </p>

        <Card className="bg-card border border-border shadow-lg rounded-2xl p-6 w-full max-w-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Sign Up</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your account
            </p>
            <p className="text-sm mt-2 font-medium">I am a...</p>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-4">

              
              <div className="flex gap-4 flex-col sm:flex-row">
                <label className="flex items-center gap-2 border border-border bg-background rounded-md px-6 py-2 text-sm cursor-pointer">
                  <input type="radio" name="role" value="recruiter" />
                  Recruiter
                </label>

                <label className="flex items-center gap-2 border border-border bg-background rounded-md px-6 py-2 text-sm cursor-pointer">
                  <input type="radio" name="role" value="interviewee" />
                  Interviewee
                </label>
              </div>

            
              <div className="flex gap-4 flex-col sm:flex-row mt-2">
                <label className="text-sm flex-1">
                  First Name<br />
                  <input
                    type="text"
                    placeholder="Enter first name"
                    className="border border-border bg-background rounded-md px-4 py-2 text-sm w-full"
                  />
                </label>
                <label className="text-sm flex-1">
                  Last Name<br />
                  <input
                    type="text"
                    placeholder="Enter last name"
                    className="border border-border bg-background rounded-md px-4 py-2 text-sm w-full"
                  />
                </label>
              </div>

              
              <div className="flex flex-col mt-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-border bg-background rounded-md px-4 py-2 text-sm mt-1"
                />
              </div>

           
              <div className="flex gap-4 flex-col sm:flex-row mt-2">
                <label className="text-sm flex-1">
                  Password<br />
                  <input
                    type="password"
                    placeholder="Create password"
                    className="border border-border bg-background rounded-md px-4 py-2 text-sm w-full"
                  />
                </label>
                <label className="text-sm flex-1">
                  Confirm Password<br />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="border border-border bg-background rounded-md px-4 py-2 text-sm w-full"
                  />
                </label>
              </div>

             
              <div className="flex flex-col mt-2">
                <label className="text-sm font-medium">
                  Bio <span className="text-muted-foreground">(Professional Summary)</span>
                </label>
                <textarea
                  placeholder="Tell us about your skills and experience"
                  className="border border-border bg-background rounded-md px-4 py-2 mt-2 text-sm h-24"
                />
              </div>

             
              <Button asChild size="lg" className="text-lg px-8 mt-2">
                <Link to="/login">
                  <span className="inline-flex items-center">Create Account</span>
                </Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default Signup;
