import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from '../pages/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl font-bold text-blue-600 mb-4 dark:text-blue-400">404</h1>
        <h2 className="text-2xl font-semibold mb-2 dark:text-gray-100">Page Not Found</h2>
        <p className="mb-6 text-gray-500 text-center max-w-md dark:text-gray-400">
          Sorry, the page you are looking for does not exist or has been moved.<br />
          Please check the URL or return to the homepage.
        </p>
        <Link to="/">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow dark:bg-blue-500 dark:hover:bg-blue-600">
            Go to Home
          </button>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
