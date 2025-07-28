import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login'
import { ThemeProvider } from './components/ThemeProvider';
import IntervieweeDashboard from './pages/Interviewee/IntervieweeDashboard';
import IntervieweeSidebar from './components/IntervieweeSidebar';
import NavbarDashboard from './components/NavbarDashboard';
import AvailableTests from './pages/Interviewee/AvailableTests';
import MyResults from './pages/Interviewee/MyResults';
import PracticeArena from './pages/Interviewee/PracticeArena';
import ScheduledInterviews from './pages/Interviewee/ScheduledInterviews';
import IntervieweeProfile from './pages/Interviewee/IntervieweeProfile';
import IntervieweeNotification from './pages/Interviewee/IntervieweeNotification';
import IntervieweeSettings from './pages/Interviewee/IntervieweeSettings';
import MyMessages from './pages/Interviewee/myMessages';
import Onboarding from './pages/Onboarding';
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard';
import Assessments from './pages/Recruiter/Assessments';
import Candidates from './pages/Recruiter/Candidates'
import ResultsAnalytics from './pages/Recruiter/ResultsAnalytics'
import Interview from './pages/Recruiter/Interview'
import CreateAssessment from './pages/Recruiter/CreateAssessment'
import RecruiterProfile from './pages/Recruiter/Profile';
import Settings from './pages/Recruiter/Settings';
import NotFound from './pages/404 Errorpage';
import About from './pages/About';
import Pricing from './pages/Pricing';





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
      <Route path="/about" element={<About/>} /> 
      <Route path="/pricing" element={<Pricing/>} />


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