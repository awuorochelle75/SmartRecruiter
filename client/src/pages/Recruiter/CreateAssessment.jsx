import SidebarRecruiter from '../../components/SidebarRecruiter'
import NavbarDashboard from '../../components/NavbarDashboard';
import { Button } from '../../components/ui/button'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';


export default function CreateAssessment(){
  return(
   <div className='flex h-screen'>
   <div className='w-64' >
     <SidebarRecruiter />
    </div>

    <div className="flex-1 flex flex-col">
    <div className="h-16 bg-white shadow">
      <NavbarDashboard />
      </div>

       <div className="flex-1 p-4 bg-gray-50 overflow-auto">
      <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold">Create Assessment</h1>
      <p className="text-sm mt-2">
        Design a comprehensive  technical assignment.
      </p>
    </div>
    <div className="flex gap-4">
      <Button asChild size="sm" variant="outline" className="text-sm px-6">
        <Link to="/createassessment">
          <span className="flex items-center">Save draft</span>
        </Link>
      </Button>

        <Button asChild size="sm"  className="text-sm px-2">
        <Link to="/invite candidates">
          <span className="flex items-center">Publish</span>
        </Link>
      </Button>
      </div>

      
      </div>
      <div className="px-6 py-8 max-w-6xl mx-auto">
      <Card className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          
          <div className="flex justify-between gap-6 flex-col md:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title</label>
              <Input placeholder="Enter assessment title" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="aptitude">Aptitude</SelectItem>
                  <SelectItem value="personality">Personality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              placeholder="Description"
              className="min-h-[100px]"
            />
          </div>

          
          <div className="flex justify-between gap-6 flex-col md:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <Input type="number" placeholder="60" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
              <Input type="number" placeholder="e.g. 70" />
            </div>
          </div>

        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions for Candidates</label>
            <Textarea
              placeholder="Provide clear instructions on how to complete this assessment..."
              className="min-h-[100px]"
            />
          </div>

       
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2">
              <Input placeholder="Enter a tag" />
              <Button type="button">Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
      </div>
      </div>
      </div>
      )
      }