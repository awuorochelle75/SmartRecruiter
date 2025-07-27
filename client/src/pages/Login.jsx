import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Card,CardHeader,CardTitle,CardContent,} from "../components/ui/card";
import { Button } from "../components/ui/button";
import NavbarDashboard from "../components/DashboardNavbar";
import { Code2 } from "lucide-react";
import Footer from "./Footer";

function Login() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === "recruiter") {
      navigate("/recruiterdashboard");
    } else if (role === "interviewee") {
      navigate("/IntervieweeDashboard");
    } else {
      alert("Please select a role");
    }
  };

  return (
    <div className="bg-muted min-h-screen text-foreground">
      <NavbarDashboard />

      <div className="flex flex-col items-center gap-2 px-4 mt-4">
        <Link to="/" className="flex items-center space-x-2 mt-5">
          <Code2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">SmartRecruiter</span>
        </Link>

        <h2 className="font-bold text-lg">Welcome Back</h2>
        <p className="text-sm text-muted-foreground font-light text-center">
          Sign in to your account to continue
        </p>

        <Card className="bg-card border border-border shadow-lg rounded-2xl p-6 w-full max-w-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your account
            </p>
            <p className="text-sm mt-2 font-medium">I am a...</p>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
             
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-border bg-background rounded-md px-4 py-2 text-sm w-full"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="recruiter">Recruiter</option>
                <option value="interviewee">Interviewee</option>
              </select>

              
              <div className="flex flex-col mt-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-border bg-background rounded-md px-4 py-2 text-sm mt-1"
                />
              </div>

              
              <div className="flex flex-col mt-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="border border-border bg-background rounded-md px-4 py-2 text-sm mt-1"
                />
              </div>

             
              <Link to="/resetpassword" className="text-primary text-sm">
                Forgot your password?
              </Link>

              <Button size="lg" className="text-lg px-8 mt-2" type="submit">
                <span className="inline-flex items-center">Sign In</span>
              </Button>

              
              <p className="flex justify-center text-sm mt-2">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary ml-1">
                  Sign Up here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
