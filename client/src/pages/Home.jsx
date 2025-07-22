import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom'
import Footer from './Footer'
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button'

export default function Home(){
    return(
        <div className='min-h-screen bg-background'>
        <Navbar />
        <section className="relative py-20 lg:py-32 bg-gray-200"> 
          <div className='text-center'>
            <h1 className='text-4xl lg-text-6xl font-bold text-foreground mb-6'>Better Technical Hiring</h1>
            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>SmartRecruiter automates technical interviews with intelligent assessments,helping you identify top talent faster and more accurately than ever before. </p>
          </div>
           <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild size="lg" className="text-lg px-8 ">
              <Link to="/signup">
               <span className='inline-flex items-center '>Get Started</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="text-lg px-8 ">
              <Link to="/signup">
               <span className='inline-flex items-center '>Sign In</span>
              </Link>
            </Button>

           </div>

        </section>
        <section className='bg-white-500'>
            <div className=' flex flex-col items-center justify-center mt-10'>
                <h1 className='text-4xl text-black font-bold'>Why Choose SmartRecruiter?</h1>
                <p className='text-2xl  text-black mt-5'>Our platform combines cutting-edge technology with intuitive design to streamline your technical recruitement process.</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-10 mt-10 mb-10">
               <Card className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-4">
                <CardHeader>
                 <CardTitle className="text-accent-700 text-lg">Smart Candidate Matching</CardTitle>
                </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-zinc-600 list-disc list-inside text-left mb-2">
                       <li>AI-based filtering</li>
                       <li>Job-fit suggestions</li>
                       <li>Real-time candidate tracking</li>
                    </ul>
                </CardContent>
              </Card>
                <Card className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-4">
                <CardHeader>
                 <CardTitle className="text-accent-700 text-lg">Comprehensive Analytics</CardTitle>
                </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-zinc-600 list-disc list-inside text-left mb-2">
                       <li>Access detailed hiring insights</li>
                       <li>Review candidate performance metrics</li>
                       <li>Make informed,data-driven decisions</li>
                    </ul>
                </CardContent>
              </Card>

                <Card className="bg-white border border-zinc-200 shadow-lg rounded-2xl p-4">
                <CardHeader>
                 <CardTitle className="text-accent-700 text-lg">Fast</CardTitle>
                </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-zinc-600 list-disc list-inside text-left mb-2">
                       <li>Instant platform setup</li>
                       <li>Start screening candidates right away</li>
                       <li>Accelerate your hiring process effortlessly</li>
                    </ul>
                </CardContent>
              </Card>

              
           </div>
         
        </section>
        <Footer />
        </div>
    )
}


  