import React from 'react';

const interviews = [
  {
    id: 1,
    position: 'Frontend Developer',
    date: '2025-07-25',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  {
    id: 2,
    position: 'Backend Developer',
    date: '2025-07-28',
    time: '2:00 PM',
    status: 'Pending',
  },
];

function IntervieweeDashboard() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Interviewee Dashboard</h1>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Upcoming Interviews</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Position</th>
              <th className="py-2">Date</th>
              <th className="py-2">Time</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{interview.position}</td>
                <td className="py-2">{interview.date}</td>
                <td className="py-2">{interview.time}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      interview.status === 'Scheduled'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`}
                  >
                    {interview.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IntervieweeDashboard;
