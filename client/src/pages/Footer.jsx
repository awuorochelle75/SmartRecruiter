import { Link,useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Footer(){
    return(
        <footer className='bg-blue-950 p-12 flex justify-between'>
            <div >
                <h1 className='font-bold text-white text-xs'>Smart Recruiter</h1>
                <p className='font-light italic text-white text-xs mt-4'>Smart technical interviews with automated assessments <br /> and intelligent evaluation tools for modern recruitement.</p>
                <hr className='my-4 border-t border-white-300 mt-8'></hr>
                <p className='text-white font-light text-xs'>&copy; 2025 Smart Recruiter. All rights reserved.</p>

            </div>
             <div className='text-white text-xs flex flex-col space-y-3'>
                <h1 className='font-bold'>Quick Links</h1>
                    <Link to = "/">Home</Link>
                            <Link to = "/pricing">Pricing</Link>
                            <Link to = "/about">About</Link>
                              <Link to = "/about">Login</Link>


             </div>
                <div className='text-white text-xs flex flex-col space-y-3'>
                <h1 className='font-bold'>Support</h1>
                    <Link to = "/helpcenter">Help Center</Link>
                            <Link to = "/documentation">Documentation</Link>
                            <Link to = "/faq">FAQ</Link>
                              <Link to = "/contactsupport">Contact Support</Link>


             </div>

        </footer>
    )
}
export default Footer;
