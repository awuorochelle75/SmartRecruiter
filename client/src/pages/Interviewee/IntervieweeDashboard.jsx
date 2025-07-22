import React from "react";

const IntervieweeDashboard = () => {
  return (
    <div className="flex min-h-screen font-scan">
      
      {/* {main content} */}
      <div className="flex-1 flex flex-col">
        {/* {topbar} */}
        <div className="p-4 border-b bg-white">
          <p>TopBAr Test</p>
        </div>
        {/* {page content} */}
        <div className="flex-1 p-4 bg-gray-50">
          {/* {main dashboard} */}
          <h2 className="text-2xl font-bold">DashBoard Content</h2>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;
