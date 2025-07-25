import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-blue-950 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
      <div className="text-white text-xs text-center md:text-left">
        <h1 className="font-bold">Smart Recruiter</h1>
        <p className="font-light italic mt-4">
          Smart technical interviews with automated assessments <br />
          and intelligent evaluation tools for modern recruitment.
        </p>
        <hr className="my-4 border-t border-white mt-8" />
        <p className="font-light">&copy; 2025 Smart Recruiter. All rights reserved.</p>
      </div>

      <div className="text-white text-xs flex flex-col items-center md:items-start space-y-3">
        <h1 className="font-bold">Quick Links</h1>
        <Link to="/">Home</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
      </div>

      <div className="text-white text-xs flex flex-col items-center md:items-start space-y-3">
        <h1 className="font-bold">Support</h1>
        <Link to="/helpcenter">Help Center</Link>
        <Link to="/documentation">Documentation</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contactsupport">Contact Support</Link>
      </div>
    </footer>
  );
}

export default Footer;
