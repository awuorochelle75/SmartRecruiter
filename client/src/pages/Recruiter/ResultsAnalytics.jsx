import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'
import { Eye } from 'lucide-react'
import { Progress } from '../../components/ui/progress'

export default function ResultsAnalytics() {
  const myAssessmentResultsData = [
    {
      id: 1,
      avatar: "/avatars/rochelle.jpg",
      name: "Rochelle Awuor ",
      email: "rochelle@gmail.com",
      position: "Frontend Developer",
      skills: "React, JavaScript",
      score: 87,
      status: "shortlisted",
      completedDate: "July 21, 2025",
    },
    // more entries...
  ];

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 fixed h-full z-50">
        <SidebarRecruiter />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar */}
        <div className="h-16 bg-white shadow z-10">
          <NavbarDashboard />
        </div>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Candidates</h1>
              <p className="text-sm mt-2">
                Manage and evaluate your candidate pipeline.
              </p>
            </div>
            <div className="flex gap-4">
              <Button asChild size="sm" className="text-sm px-6">
                <Link to="/createassessment">
                  <span className="flex items-center">Export Candidates</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 px-2 md:px-10 mt-10 mb-10">
            <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
              <CardHeader>
                <CardTitle className="text-accent-700 font-normal text-lg">Total Candidates</CardTitle>
              </CardHeader>
              <CardContent className='font-bold'>4</CardContent>
            </Card>

            <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
              <CardHeader>
                <CardTitle className="text-accent-700 font-normal text-lg">Shortlisted</CardTitle>
              </CardHeader>
              <CardContent className='font-bold'>1</CardContent>
            </Card>

            <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
              <CardHeader>
                <CardTitle className="text-accent-700 font-normal text-lg">Interviewed</CardTitle>
              </CardHeader>
              <CardContent className='font-bold'>1</CardContent>
            </Card>

            <Card className="bg-white border border-zinc-300 rounded-2xl p-4 whitespace-nowrap transition duration-300 ease-in-out transform-gpu hover:scale-105 hover:shadow-2xl hover:z-[999] relative">
              <CardHeader>
                <CardTitle className="text-accent-700 font-normal text-lg">Average Score</CardTitle>
              </CardHeader>
              <CardContent className='font-bold'>63%</CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center justify-between mt-4">
            <input
              type="text"
              placeholder="Search assessments..."
              className="flex-grow max-w-5xl border border-gray-300 rounded-md px-4 py-2 text-sm"
            />
            <select className="ml-4 border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Completed</option>
            </select>
          </div>

          {/* Assessment Results Table */}
          <Card className="bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-100 dark:border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">My Assessment Results</CardTitle>
              <CardDescription className="text-gray-500 text-sm dark:text-gray-400">
                Detailed results for your completed assessments
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto  max-h-[400px] max w-[1000px]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {["Candidate", "Position", "Skills", "Score", "Status", "Applied", "Actions"].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
               <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
  {myAssessmentResultsData.map((candidate) => (
    <tr key={candidate.id}>
      {/* Candidate */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.email}</p>
          </div>
        </div>
      </td>

      {/* Position */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {candidate.position}
      </td>

      {/* Skills */}
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
  <div className="flex flex-row flex-wrap items-center gap-2">
    {candidate.skills.split(',').map((skill, index) => (
      <Badge
        key={index}
        variant="outline"
        className="px-2 py-0.5 text-xs rounded-full text-blue-700 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
      >
        {skill.trim()}
      </Badge>
    ))}
  </div>
</td>



      {/* Score */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900 dark:text-white">{candidate.score}%</span>
          <Progress
            value={candidate.score}
            className="w-24 h-2 bg-gray-200 dark:bg-gray-700"
            indicatorClassName="bg-blue-500"
          />
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant="outline"
          className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 border-green-600 bg-green-50/20 dark:bg-green-900/20"
        >
          {candidate.status}
        </Badge>
      </td>

      {/* Applied */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {candidate.completedDate}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 rounded-full"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
