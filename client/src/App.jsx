"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ToastProvider } from "./components/ui/use-toast"

// Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Onboarding from "./pages/Onboarding"
import Pricing from "./pages/Pricing"
import About from "./pages/About"
import NotFound from "./pages/NotFound"

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard"
import CreateAssessment from "./pages/recruiter/CreateAssessment"
import EditAssessment from "./pages/recruiter/EditAssessment"
import RecruiterAssessments from "./pages/recruiter/Assessments"
import Candidates from "./pages/recruiter/Candidates"
import RecruiterResults from "./pages/recruiter/Results"
import Interviews from "./pages/recruiter/Interviews"
import Messages from "./pages/recruiter/Messages"
import Settings from "./pages/recruiter/Settings"
import RecruiterProfile from "./pages/recruiter/Profile" // New: Recruiter Profile
import RecruiterFeedback from "./pages/recruiter/Feedback" // New: Recruiter Feedback
import RecruiterNotifications from "./pages/recruiter/Notifications" // New: Recruiter Notifications
import AssessmentDetails from './pages/recruiter/AssessmentDetails';
import Results from './pages/recruiter/Results';
import ResultsAnalytics from './pages/recruiter/ResultsAnalytics';
import SendInvites from './pages/recruiter/SendInvites';
import CreateTestAssessment from './pages/recruiter/CreateTestAssessment';
import Categories from "./pages/recruiter/Categories"
import PracticeProblems from "./pages/recruiter/PracticeProblems"
import CreatePracticeProblem from "./pages/recruiter/CreatePracticeProblem"
import EditPracticeProblem from "./pages/recruiter/EditPracticeProblem"
import PracticeProblemDetails from "./pages/recruiter/PracticeProblemDetails"

// Interviewee Pages
import IntervieweeDashboard from "./pages/interviewee/IntervieweeDashboard"
import AvailableTests from "./pages/interviewee/AvailableTests"
import IntervieweeResults from "./pages/interviewee/Results"
import PracticeArena from "./pages/interviewee/PracticeArena"
import ScheduledInterviews from "./pages/interviewee/ScheduledInterviews"
import IntervieweeMessages from "./pages/interviewee/Messages"
import IntervieweeProfile from "./pages/interviewee/Profile"
import IntervieweeSettings from "./pages/interviewee/Settings"
import AssessmentPage from "./pages/interviewee/AssessmentPage"
import IntervieweeFeedback from "./pages/interviewee/Feedback"
import IntervieweeNotifications from "./pages/interviewee/Notifications"





function App() {
  return (
    < ThemeProvider  defaultTheme='system' storageKey="SmartRecruiter-Theme">
 

    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/navbar' element={<NavbarDashboard/>}/>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/intervieweedashboard" element={<IntervieweeDashboard />} />
      <Route path="/Sidebar" element={<IntervieweeSidebar />} />
      <Route path="/availabletest" element={<AvailableTests />} />
      <Route path="/results" element={<MyResults/>} />

     

      <Route path="/practice" element={<PracticeArena/>} /> 
      <Route path="/interviews" element={<ScheduledInterviews/>} /> 
      <Route path="/myProfile" element={<IntervieweeProfile/>} />
      <Route path="/notifications" element={<IntervieweeNotification/>} />
      <Route path="/mySettings" element={<IntervieweeSettings/>} />
      <Route path="/messages" element={<MyMessages/>} />

     

      


      <Route path = "/onboarding" element = {< Onboarding />} />
      <Route path = "/recruiterdashboard" element = {<RecruiterDashboard/>} />
      <Route path = "/assessments" element = {< Assessments />} />
      <Route path = "/candidates" element = {< Candidates />} />
      <Route path = "/resultsanalytics" element = {< ResultsAnalytics />} />
      <Route path = "/interview" element = {< Interview />} />
      <Route path = "/createassessment" element = {< CreateAssessment />} />
      <Route path = "/recruiter/profile" element = {< RecruiterProfile />} />
      <Route path = "/recruiter/settings" element = {< Settings />} />
      <Route path="/404" element={<NotFound />} />




     </Routes>
   
 
    </BrowserRouter>
 </ThemeProvider>
  )
}

export default App;