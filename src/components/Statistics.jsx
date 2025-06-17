import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Assuming you have react-router-dom for navigation

const Statistics = () => {
  const navigate = useNavigate();
  const [totalLinks, setTotalLinks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [activeLinks, setActiveLinks] = useState(0); // Assuming all fetched links are active, or filter if status available
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for animated values
  const [animatedTotalLinks, setAnimatedTotalLinks] = useState(0);
  const [animatedTotalClicks, setAnimatedTotalClicks] = useState(0);
  const [animatedActiveLinks, setAnimatedActiveLinks] = useState(0);

  // Refs for animation control
  const totalLinksRef = useRef(0);
  const totalClicksRef = useRef(0);
  const activeLinksRef = useRef(0);

  const animationDuration = 1000; // milliseconds

  // Animation function
  const animateValue = (start, end, duration, setValue, currentValueRef) => {
    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutQuad(progress); // Apply easing function

      const newValue = Math.floor(easedProgress * (end - start) + start);

      if (newValue !== currentValueRef.current) {
        setValue(newValue);
        currentValueRef.current = newValue;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(end); // Ensure it lands exactly on the target value
        currentValueRef.current = end;
      }
    };
    requestAnimationFrame(step);
  };

  // Easing function (Quadratic Ease Out)
  const easeOutQuad = (t) => t * (2 - t);

  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Please log in to view statistics.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("https://shorter-umber.vercel.app/urls", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          toast.error("Your session has expired. Please log in again.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const fetchedTotalLinks = data.length;
        const fetchedTotalClicks = data.reduce(
          (sum, link) => sum + (link.clicks || 0),
          0
        );

        // Assuming all fetched links are active. Adjust if your backend has a status field.
        const fetchedActiveLinks = data.filter(
          (link) => link.status === "active" || link.status === undefined
        ).length; // Example: filter by 'active' status or if status is not provided

        setTotalLinks(fetchedTotalLinks);
        setTotalClicks(fetchedTotalClicks);
        setActiveLinks(fetchedActiveLinks);

        // Start animations
        animateValue(
          0,
          fetchedTotalLinks,
          animationDuration,
          setAnimatedTotalLinks,
          totalLinksRef
        );
        animateValue(
          0,
          fetchedTotalClicks,
          animationDuration,
          setAnimatedTotalClicks,
          totalClicksRef
        );
        animateValue(
          0,
          fetchedActiveLinks,
          animationDuration,
          setAnimatedActiveLinks,
          activeLinksRef
        );
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(err.message);
        toast.error("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dark:bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold dark:text-white mb-6">
          Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dark:bg-slate-700 bg-slate-300 rounded-lg p-6 flex flex-col items-start">
            <h3 className="text-lg font-medium dark:text-white mb-2">
              Total Links
            </h3>
            <div className="w-24 h-8 dark:bg-slate-600 rounded animate-pulse skeleton-shimmer"></div>
          </div>
          <div className="dark:bg-slate-700 bg-slate-300 rounded-lg p-6 flex flex-col items-start">
            <h3 className="text-lg font-medium dark:text-white mb-2">
              Total Clicks
            </h3>
            <div className="w-24 h-8 dark:bg-slate-600 rounded animate-pulse skeleton-shimmer"></div>
          </div>
          <div className="dark:bg-slate-700 bg-slate-300 rounded-lg p-6 flex flex-col items-start">
            <h3 className="text-lg font-medium dark:text-white mb-2">
              Active Links
            </h3>
            <div className="w-24 h-8 dark:bg-slate-600 rounded animate-pulse skeleton-shimmer"></div>
          </div>
        </div>
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
            background: linear-gradient(
              to right,
              #727a86 8%,
              #99a4b4 18%,
              #a0b1c9 33%
            ); /* Slate gradient */
            background-size: 200% 100%;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark:bg-slate-800 rounded-lg border border-slate-700 p-6 text-center text-red-400">
        <p>Error: {error}</p>
        <p className="text-slate-400 text-sm mt-2">
          Please try refreshing the page or logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-800 backdrop-blur-2xl rounded-lg border border-slate-700 p-6">
      <h2 className="text-xl font-semibold dark:text-white mb-6">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dark:bg-slate-700 bg-slate-300 rounded-lg p-6">
          <h3 className="text-lg font-medium dark:text-white mb-2">
            Total Links
          </h3>
          <p className="text-3xl font-bold text-blue-500">
            {animatedTotalLinks.toLocaleString()}
          </p>
        </div>
        <div className="dark:bg-slate-700 bg-slate-300 rounded-lg p-6">
          <h3 className="text-lg font-medium dark:text-white mb-2">
            Total Clicks
          </h3>
          <p className="text-3xl font-bold text-green-500">
            {animatedTotalClicks.toLocaleString()}
          </p>
        </div>
        <div className="dark:bg-slate-700 bg-slate-300 rounded-lg p-6">
          <h3 className="text-lg font-medium dark:text-white mb-2">
            Active Links
          </h3>
          <p className="text-3xl font-bold text-yellow-500">
            {animatedActiveLinks.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
