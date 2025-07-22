import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login'
import { ThemeProvider } from './components/ThemeProvider';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    < ThemeProvider  defaultTheme='system' storageKey="SmartRecruiter-Theme">
  

    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path = "/onboarding" element = {< Onboarding />} />

     </Routes>
   
  
    </BrowserRouter>
 </ThemeProvider>
  )
}

export default App;
