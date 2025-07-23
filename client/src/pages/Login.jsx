import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import NavbarDashboard from "../components/NavbarDashboard";
import { Code2 } from "lucide-react";
import Footer from "./Footer";

function Login() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role == "recruiter") {
      navigate("/recruiter");
    } else if (role === "interviewee") {
      navigate("/IntervieweeDashboard");
    } else {
      alert("Please select a role");
    }
  };

  return (
    <div>
      <NavbarDashboard />
      <div className=" flex flex-col items-center  gap-2 px-4 mt-4  bg-gray-200 min-h-screen  ">
        <Link to="/" className="flex items-center space-x-2 mt-5 ">
          <Code2 className="h-8  w-8 text-primary " />
          <span className="text-xl font-bold text-foreground ">
            SmartRecruiter
          </span>
        </Link>
        <h2 className="font-bold text-lg ">Welcome Back </h2>
        <p className="text-sm font-light ">
          {" "}
          Sign in to your account to continue
        </p>
        <Card className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-10 w-[50%] mb-10">
          <CardHeader>
            <CardTitle className="text-black font-bold text-xl">
              Sign In{" "}
            </CardTitle>
            <h1>Enter your credentials to access your account</h1>
            <p> I am a...</p>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="recruiter">Recruiter</option>
                <option value="interviewee">Interviewee</option>
              </select>

              <div className="flex flex-col mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>

              <div className="flex flex-col mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>

              <Link to="/resetpassword" className="text-primary text-sm">
                {" "}
                Forgot your password?
              </Link>

              <Button size="lg" className="text-lg px-8 mt-2" type="submit">
                <span className="inline-flex items-center">Sign In</span>
              </Button>

              <h1 className=" flex justify-center ">
                Don't have an account?
                <Link to="/signup" className="text-primary ">
                  Sign Up here
                </Link>
              </h1>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
export default Login;
