import { ArrowRight, ChevronDown, Link, LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useTheme } from "../contexts/ThemeContext";

// --- Skeleton Components ---
const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
  <div
    className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${width} ${height} rounded animate-pulse bg-[length:200%_100%] skeleton-shimmer`}
  />
);

const SkeletonCircle = ({ size = "w-8 h-8" }) => (
  <div
    className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${size} rounded-full animate-pulse bg-[length:200%_100%] skeleton-shimmer`}
  />
);
// --- End Skeleton Components ---

const DashboardHeader = () => {
  // Removed onShortenLink from props as it's handled internally now
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { actualTheme, darkTheme, lightTheme } = useTheme();

  const handleThemeToggle = () => {
    if (actualTheme === "dark") {
      lightTheme();
    } else {
      darkTheme();
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken(); // Use getAuthToken here

        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          // No navigation here, 401 handling will manage redirect
          return;
        }

        const response = await fetch(
          "https://shorter-umber.vercel.app/users/me",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setIsAuthenticated(false);
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (!error.message.includes("Session expired")) {
          toast.error("Failed to load user data");
        }
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRedirect = () => {
    navigate("/");
  };

  // --- Start: Modified handleSubmit for API call ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a URL to shorten.");
      return;
    }

    setIsShortening(true);
    const token = getAuthToken();

    if (!token) {
      toast.error("You must be logged in to shorten links.");
      setIsShortening(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("https://shorter-umber.vercel.app/url", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target_url: url }),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Failed to shorten link: ${response.status}`
        );
      }

      const data = await response.json();
      toast.success(`Link shortened: ${data.key}`); // Assuming 'key' is part of the response for the short URL part
      setUrl(""); // Clear input after successful shortening
    } catch (error) {
      console.error("Error shortening link:", error);
      toast.error(
        error.message ||
          "An unexpected error occurred while shortening the link."
      );
    } finally {
      setIsShortening(false);
    }
  };
  // --- End: Modified handleSubmit for API call ---

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event("authStateChange"));
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const displayName = user
    ? user.username || user.email || user.name || "User"
    : "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="dark:bg-slate-900 border-b border-slate-700">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .skeleton-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-4">
          {/* Top row: Logo and User Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleRedirect}
              className="cursor-pointer flex-shrink-0"
            >
              <h1 className="text-2xl sm:text-4xl font-bold">
                <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Umber
                </span>
                <sup className="text-pink-400 text-xs ml-1">®</sup>
              </h1>
            </button>

            {/* Theme Toggle and User Dropdown */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button (always visible and functional) */}
              <button
                onClick={handleThemeToggle}
                className="w-10 h-10 dark:bg-slate-800 backdrop-blur-2xl dark:hover:bg-slate-700 transition-colors duration-200 rounded-full flex items-center justify-center border border-slate-600"
                title={`Switch to ${
                  actualTheme === "dark" ? "light" : "dark"
                } mode`}
              >
                {actualTheme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 dark:text-slate-300" />
                )}
              </button>

              {/* User Dropdown - Skeleton or actual content */}
              <div className="relative" ref={dropdownRef}>
                {loading ? (
                  <div className="flex items-center dark:bg-slate-800 rounded-full px-3 py-2 border border-slate-600">
                    <SkeletonCircle size="w-8 h-8" />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center backdrop-blur-2xl dark:bg-slate-800 transition-colors duration-200 rounded-full px-3 py-2 border border-slate-600"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {userInitial}
                      </span>
                    </div>
                  </button>
                )}

                {!loading && isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 dark:bg-slate-800 backdrop-blur-2xl border border-slate-600 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-slate-700">
                        <span className="dark:text-slate-300 text-slate-500 text-xs">
                          Welcome
                        </span>
                        <div
                          className="dark:text-white font-medium truncate"
                          title={displayName}
                        >
                          {displayName}
                        </div>
                        {user && user.email && user.email !== displayName && (
                          <div
                            className="dark:text-slate-300 text-slate-500 text-xs truncate"
                            title={user.email}
                          >
                            {user.email}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 dark:text-slate-300 dark:hover:text-white hover:text-red-500 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center dark:bg-gray-800/80 backdrop-blur-2xl rounded-full border border-gray-600/50 p-3 shadow-2xl">
              <Link className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="url"
                placeholder="Enter the link here"
                className="flex-1 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none text-sm min-w-0"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isShortening}
              />
              <button
                onClick={handleSubmit}
                disabled={isShortening || !url.trim()}
                className="cursor-pointer ml-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white p-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-blue-500/25 flex-shrink-0"
              >
                {isShortening ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          <button
            onClick={handleRedirect}
            className="cursor-pointer flex-shrink-0"
          >
            <h1 className="text-3xl xl:text-4xl font-bold">
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Umber
              </span>
              <sup className="text-pink-400 text-xs ml-1">®</sup>
            </h1>
          </button>

          <div className="flex-1 max-w-8xl mx-8">
            <div className="flex items-center dark:bg-gray-800/80 backdrop-blur-2xl rounded-full border border-gray-600/50 p-3 shadow-2xl">
              <Link className="w-6 h-6 text-gray-400 ml-2 mr-3 flex-shrink-0" />
              <input
                type="url"
                placeholder="Enter the link here"
                className="flex-1 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none text-base min-w-0"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isShortening}
              />
              <button
                onClick={handleSubmit}
                disabled={isShortening || !url.trim()}
                className="cursor-pointer ml-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 flex-shrink-0"
              >
                {isShortening ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Shortening...</span>
                  </>
                ) : (
                  <span>Shorten</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* User Dropdown - Skeleton or actual content */}
            <div className="relative" ref={dropdownRef}>
              {loading ? (
                <div className="flex items-center space-x-3 dark:bg-slate-800 rounded-full px-4 py-3 border border-slate-600">
                  <span className="ms-2 flex flex-col items-start gap-1">
                    <SkeletonLine width="w-16" height="h-3" />
                    <SkeletonLine width="w-24" height="h-4" />
                  </span>
                  <SkeletonCircle size="w-8 h-8" />
                  <SkeletonCircle size="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 backdrop-blur-2xl dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-200 rounded-full px-4 py-3 border border-slate-600"
                >
                  <span className="ms-2 flex flex-col items-start">
                    <span className="dark:text-slate-300 text-slate-400 text-xs">
                      Welcome
                    </span>
                    <span
                      className="dark:text-white font-medium text-sm max-w-32 truncate"
                      title={displayName}
                    >
                      {displayName}
                    </span>
                  </span>

                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userInitial}
                    </span>
                  </div>

                  <ChevronDown
                    className={`dark:text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    size={16}
                  />
                </button>
              )}

              {!loading && isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 backdrop-blur-2xl dark:bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <div
                        className="dark:text-white font-medium truncate"
                        title={displayName}
                      >
                        {displayName}
                      </div>
                      {user && user.email && user.email !== displayName && (
                        <div
                          className="dark:text-slate-400 text-slate-500 text-xs truncate"
                          title={user.email}
                        >
                          {user.email}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 dark:text-slate-300 dark:hover:text-white hover:text-red-500 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
