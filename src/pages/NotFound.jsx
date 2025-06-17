import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Frown, Home } from "lucide-react";
import swirlImage from "../assets/Swirl.png";
import patternImage from "../assets/Property 1=Variant2.png";

const NotFound = () => {
  useEffect(() => {
    // Optional: Set document title for this page
    document.title = "Umber - Page Not Found";
    return () => {
      document.title = "Umber"; // Reset or set to default when component unmounts
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden dark:bg-slate-900 flex flex-col items-center justify-center text-center p-6">
      {/* Animated swirl background - Copied from Dashboard.jsx */}
      <div
        className="fixed inset-0 bg-no-repeat bg-center bg-contain pointer-events-none z-0
        brightness-75 contrast-125 hue-rotate-180
        dark:brightness-100 dark:contrast-100 dark:hue-rotate-0"
        style={{
          backgroundImage: `url(${swirlImage})`,
          animation: "spin 30s linear infinite",
        }}
      />

      {/* Static pattern background - Copied from Dashboard.jsx */}
      <div
        className="fixed inset-0 bg-repeat bg-contain pointer-events-none z-0
        brightness-100 invert opacity-100 drop-shadow-sm
        dark:brightness-100 dark:invert-0 dark:opacity-100"
        style={{
          backgroundImage: `url(${patternImage})`,
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 p-8 md:p-12 bg-white/5 dark:bg-slate-800/50 backdrop-blur-md rounded-xl shadow-lg border border-white/10 dark:border-slate-700 max-w-lg w-full transform animate-fade-in">
        {/* 404 Heading */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-blue-500 mb-4 animate-bounce-slow">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold dark:text-white mb-4 animate-fade-in delay-200">
          <Frown size={48} className="inline-block mb-2 mr-2 text-slate-400" />
          Page Not Found
        </h2>
        <p className="text-lg dark:text-slate-300 mb-8 animate-fade-in delay-400">
          Oops! It looks like you've stumbled upon a page that doesn't exist.
          Don't worry, we'll help you get back on track.
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 animate-fade-in delay-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Home size={20} className="mr-2" />
          Go to Homepage
        </Link>
      </div>

      {/* Custom Styles for Animations (can be moved to a global CSS file if preferred) */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceSlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
