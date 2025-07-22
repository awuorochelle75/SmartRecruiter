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

function App() {
  return (
    < ThemeProvider  defaultTheme='system' storageKey="SmartRecruiter-Theme">
  

    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/interviewee" element={<IntervieweeDashboard />} />
      <Route path="/recruiter" element={<RecruiterDashboard />} />
      <Route path="/Sidebar" element={<IntervieweeSidebar />} />

     </Routes>
   
  
    </BrowserRouter>
 </ThemeProvider>
  )
}

export default App;
