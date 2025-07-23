import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login'
import { ThemeProvider } from './components/ThemeProvider';
import IntervieweeDashboard from './pages/Interviewee/IntervieweeDashboard';
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard';
import IntervieweeSidebar from './components/IntervieweeSidebar';
import NavbarDashboard from './components/NavbarDashboard';
import AvailableTests from './pages/Interviewee/AvailableTests';
import MyResults from './pages/Interviewee/MyResults';
import PracticeArena from './pages/Interviewee/PracticeArena';
import ScheduledInterviews from './pages/Interviewee/ScheduledInterviews';
import IntervieweeProfile from './pages/Interviewee/IntervieweeProfile';
import IntervieweeNotification from './pages/Interviewee/IntervieweeNotification';


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
      <Route path="/recruiter" element={<RecruiterDashboard />} />
      <Route path="/Sidebar" element={<IntervieweeSidebar />} />
      <Route path="/availabletest" element={<AvailableTests />} />
      <Route path="/results" element={<MyResults/>} />
      <Route path="/practice" element={<PracticeArena/>} /> 
      <Route path="/interviews" element={<ScheduledInterviews/>} /> 
      <Route path="/myProfile" element={<IntervieweeProfile/>} />
      <Route path="/notifications" element={<IntervieweeNotification/>} />

     </Routes>
   
  
    </BrowserRouter>
 </ThemeProvider>
  )
}

export default App;
