import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import Navbar from "../components/Navbar"
import Footer from '../pages/Footer';
// import Footer from "../components/Footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-7xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Sorry, the page you are looking for does not exist or has been moved.<br />
          Please check the URL or return to the homepage.
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/">Go to Home</Link>
        </Button>
      </main>
      <Footer />
    </div>
  )
} 