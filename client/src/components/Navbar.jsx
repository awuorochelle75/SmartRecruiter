import { Link,useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useState } from 'react';


function Navbar(){
 return (
    <nav className="w-full bg-white-500 text-black p-5 flex justify-between ">
        <div className='font-thin text-xl'>SmartRecruiter</div>
        <div className = "space-x-10">
            <Link to = "/">Home</Link>
            <Link to = "/pricing">Pricing</Link>
            <Link to = "/about">About</Link>
             
        </div>
        <div>
            <Link to = "/about">Login</Link>
        </div>
     
    </nav>
  );
}


export default Navbar;