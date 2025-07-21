import { BrowserRouter, Router, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">Smart Recruiter</h1>
    </div>
    </BrowserRouter>
  )
}

export default App;
