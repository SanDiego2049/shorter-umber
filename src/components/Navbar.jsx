import { LogIn, LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use the theme context
  const { actualTheme, darkTheme, lightTheme } = useTheme();

  // Function to toggle theme based on current actualTheme
  const handleThemeToggle = () => {
    if (actualTheme === "dark") {
      lightTheme();
    } else {
      darkTheme();
    }
  };

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    };

    // Check on mount
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener("storage", checkAuthStatus);

    // Custom event listener for login/logout actions in the same tab
    window.addEventListener("authStateChange", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authStateChange", checkAuthStatus);
    };
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleLogoutClick = () => {
    // Clear tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Update auth state
    setIsAuthenticated(false);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authStateChange"));

    // Show success message
    toast.success("Logged out successfully!");

    // Redirect to home page
    navigate("/");
  };

  return (
    <nav className="w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Umber
              </span>
              <sup className="text-pink-400 text-xs ml-1">®</sup>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated user buttons
              <>
                <button
                  onClick={handleDashboardClick}
                  className="cursor-pointer bg-transparent flex items-center gap-2 py-2 dark:text-gray-300 text-gray-800 dark:hover:text-white transition-colors duration-200 rounded-full border border-gray-400 px-6"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="cursor-pointer px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-red-500/25"
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </span>
                </button>
              </>
            ) : (
              // Non-authenticated user buttons
              <>
                <button
                  onClick={handleLoginClick}
                  className="cursor-pointer bg-transparent flex items-center gap-2 py-2 dark:text-gray-300 text-gray-800 dark:hover:text-white transition-colors duration-200  rounded-full border border-gray-400 px-6"
                >
                  <span>Login</span>
                  <LogIn size={16} />
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Register Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center space-x-2">
            {isAuthenticated ? (
              // Authenticated user buttons (mobile)
              <>
                <button
                  onClick={handleDashboardClick}
                  // Changed px-3 to px-2, added hidden for text on extra small screens, and flex-none to prevent shrinking
                  className="cursor-pointer bg-transparent flex items-center gap-1 px-2 py-2 dark:text-gray-300 text-gray-800 dark:hover:text-white transition-colors duration-200 rounded-full border border-gray-400 flex-none"
                >
                  <LayoutDashboard size={18} />{" "}
                  {/* Increased icon size for better visibility */}
                  <span className="text-sm font-medium hidden xs:inline">
                    Dashboard
                  </span>{" "}
                  {/* Hidden on very small screens, visible on 'xs' breakpoint */}
                </button>
                <button
                  onClick={handleLogoutClick}
                  // Changed px-4 to px-2, text-sm to text-xs, and added hidden for text on extra small screens, and flex-none
                  className="cursor-pointer px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-red-500/25 text-xs flex items-center gap-1 flex-none"
                >
                  <LogOut size={18} /> {/* Increased icon size */}
                  <span className="hidden xs:inline">Logout</span>{" "}
                  {/* Hidden on very small screens, visible on 'xs' breakpoint */}
                </button>
              </>
            ) : (
              // Non-authenticated user buttons (mobile)
              <>
                <button
                  onClick={handleLoginClick}
                  // Adjusted padding and text size for smaller screens
                  className="cursor-pointer bg-transparent flex items-center gap-1 px-2 py-2 dark:text-gray-300 text-gray-800 dark:hover:text-white transition-colors duration-200 rounded-full border border-gray-400 flex-none"
                >
                  <span className="text-sm font-medium hidden xs:inline">
                    Login
                  </span>
                  <LogIn size={18} />
                </button>
                <button
                  onClick={handleRegisterClick}
                  // Adjusted padding and text size for smaller screens
                  className="cursor-pointer px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 shadow-lg hover:shadow-blue-500/25 text-sm flex-none"
                >
                  <span className="hidden xs:inline">Register</span>
                  <LogIn size={18} className="xs:hidden" />{" "}
                  {/* Show icon only on extra small screens */}
                </button>
              </>
            )}
            {/* Theme Toggle Button (always visible and functional) */}
            <button
              onClick={handleThemeToggle}
              className="w-10 h-10 dark:bg-slate-800 hover:bg-slate-700 transition-colors duration-200 rounded-full flex items-center justify-center border border-slate-600 flex-none"
              title={`Switch to ${
                actualTheme === "dark" ? "light" : "dark"
              } mode`}
            >
              {actualTheme === "dark" ? ( // Use actualTheme
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
