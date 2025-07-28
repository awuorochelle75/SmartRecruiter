import React from "react";
import { Star } from "lucide-react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { Card, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";


// Mock data for testimonials (Kenyan-based dummy data)
const testimonialsData = [
  {
    id: 1,
    name: "Amina Juma",
    title: "HR Manager",
    company: "Safaricom PLC",
    quote: "SmartRecruiter transformed our hiring process. The assessments are incredibly insightful, and the platform is a joy to use. Highly recommend for any company looking to streamline their recruitment!",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "David Kimani",
    title: "Senior Software Engineer",
    company: "Andela Kenya",
    quote: "As a candidate, I found SmartRecruiter's tests challenging yet fair. The feedback was constructive, helping me pinpoint areas for improvement. A truly professional experience.",
    avatar: "https://randomuser.me/api/portraits/men/70.jpg",
    rating: 4,
  },
  {
    id: 3,
    name: "Fatima Ali",
    title: "Talent Acquisition Lead",
    company: "Equity Bank Group",
    quote: "The ability to customize assessments and track candidate progress in real-time has been invaluable. SmartRecruiter saves us countless hours and ensures we find the best talent.",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    rating: 5,
  },
  {
    id: 4,
    name: "Brian Omondi",
    title: "Full Stack Developer",
    company: "M-Pesa Africa",
    quote: "I appreciate how user-friendly the platform is. Taking tests was straightforward, and the interface is clean. It's a great tool for both recruiters and candidates.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 4,
  },
];

// Kenyan-themed placeholder image URLs for background/hero sections
const kenyanImageUrls = {
  hero: "https://placehold.co/1920x800/2C3E50/E0E7FF?text=Nairobi+Skyline", // Darker blue background
  mission: "https://placehold.co/1200x600/34495E/E0E7FF?text=Maasai+Mara+Sunset", // Slightly different dark blue
};

const About = () => {
  return (
    <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-gray-900">


      {/* Main Content Area */}
      <div className="flex-1  flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar/>

        {/* Hero Section */}
        <section
          className="relative h-96 bg-cover bg-center flex items-center justify-center text-center p-6"
          style={{ backgroundImage: `url(${kenyanImageUrls.hero})` }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay for text readability */}
          <div className="relative z-10 text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About SmartRecruiter</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Revolutionizing talent acquisition through intelligent assessments and seamless connections.
            </p>
          </div>
        </section>

        {/* Our Mission/Story Section */}
        <section className="py-16 px-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              At SmartRecruiter, we believe in a world where talent finds opportunity effortlessly, and companies discover the perfect fit with precision. Our mission is to empower both job seekers and recruiters with cutting-edge technology that streamlines the assessment process, reduces bias, and fosters genuine connections.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Founded in Nairobi, Kenya, we are committed to building a platform that not only meets global standards but also understands the unique dynamics of the African job market. We strive to create a fair, transparent, and efficient ecosystem for talent acquisition.
            </p>
          </div>
        </section>

        {/* Testimonials Section Placeholder */}
        <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">What Our Users Say</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Hear from the candidates and recruiters who've experienced the SmartRecruiter difference.
            </p>
            {/* Testimonials will be rendered here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Individual Testimonial Cards will go here */}
                <p className="text-gray-500 dark:text-gray-400">Testimonials content will be populated here.</p>
            </div>
          </div>
        </section>

        {/* Call to Action Section Placeholder */}
        <section className="py-16 px-6 bg-blue-600 dark:bg-blue-800 text-white text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Hiring?</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Join SmartRecruiter today and experience the future of talent acquisition.
          </p>
          <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-700 rounded-md px-8 py-3 text-lg font-semibold shadow-lg">
            Get Started Now
          </Button>
        </section>
      </div>
    </div>
  );
};

export default About;
