import React from "react";
import { Search, Bell, User } from "lucide-react";
import IntervieweeSidebar from "../../components/IntervieweeSidebar"; // adjust path if needed
import Navbar from "../../components/Navbar";
import NavbarDashboard from "../../components/NavbarDashboard";

const IntervieweeDashboard = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      <IntervieweeSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <NavbarDashboard/>

        {/* Page Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Interviewee Dashboard
          </h2>
          <p className="text-gray-700">
            Welcome to your dashboard. Here you'll find your assessments,
            interviews, messages, and performance analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;
