import {
  Copy,
  QrCode,
  ExternalLink,
  Loader2, // This one is not used directly in current rendering, but good to keep if needed
  AlertCircle,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import QrCodeModal from "../components/QrCodeModal";

// Skeleton Components (Keep these as they are, they are well-structured)
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

const SkeletonTableRow = () => (
  <tr className="hover:bg-slate-750 transition-colors">
    <td className="py-4 px-4">
      <div className="flex items-center gap-2">
        <SkeletonLine width="w-48" height="h-4" />
        <SkeletonCircle size="w-4 h-4" />
      </div>
    </td>
    <td className="py-4 px-4">
      <SkeletonLine width="w-64" height="h-4" />
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center justify-center">
        <SkeletonCircle size="w-8 h-8" />
      </div>
    </td>
    <td className="py-4 px-4">
      <SkeletonLine width="w-20" height="h-4" />
    </td>
    <td className="py-4 px-4">
      <SkeletonLine width="w-12" height="h-4" />
    </td>
  </tr>
);

const SkeletonMobileCard = () => (
  <div className="dark:bg-slate-700 rounded-lg p-4 space-y-3">
    {/* Header with platform icon and status */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-4 h-4" />
      </div>
      <SkeletonLine width="w-16" height="h-3" />
    </div>

    {/* Short URL */}
    <div className="space-y-1">
      <label className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
        Short Link
      </label>
      <div className="flex items-center gap-2">
        <SkeletonLine width="w-40" height="h-4" />
        <SkeletonCircle size="w-4 h-4" />
      </div>
    </div>

    {/* Original URL */}
    <div className="space-y-1">
      <label className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
        Original Link
      </label>
      <SkeletonLine width="w-full" height="h-4" />
    </div>

    {/* Stats row */}
    <div className="flex justify-between items-center pt-2 border-t border-slate-600">
      <div className="text-center">
        <div className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
          Date
        </div>
      </div>
      <SkeletonLine width="w-24" height="h-4" />
    </div>
  </div>
);

const URL_LIMIT = 5; // Define the maximum number of URLs to show

// MODIFICATION START: Accept refreshTrigger prop
const UrlTable = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true); // True by default for initial state
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // New state to manage the initial "fake" loading for unauthenticated users
  const [showInitialSkeletonAndRedirect, setShowInitialSkeletonAndRedirect] =
    useState(true);

  // New state for QR code modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedShortLinkKey, setSelectedShortLinkKey] = useState(null);
  const [selectedShortUrl, setSelectedShortUrl] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  useEffect(() => {
    const token = getAuthToken();

    if (token) {
      setIsLoggedIn(true);
      setShowInitialSkeletonAndRedirect(false);
      fetchUrls();
    } else {
      setLoading(true);
      setError(null);

      const redirectTimer = setTimeout(() => {
        setLoading(false);
        setShowInitialSkeletonAndRedirect(false);
        navigate("/login");
      }, 5000);

      return () => clearTimeout(redirectTimer);
    }
  }, [refreshTrigger]); // MODIFICATION: Add refreshTrigger to dependency array

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch("https://shorter-umber.vercel.app/urls", {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transformedData = data
        .map((item, index) => ({
          id: item.id || index + 1,
          key: item.key,
          shortUrl: `https://shorter-umber.vercel.app/s/${item.key}`,
          target_url: item.original_url || item.target_url,
          qrCode: true,
          date: item.date_created
            ? formatDate(item.date_created)
            : new Date().toLocaleDateString(),
          dateRaw: item.date_created ? new Date(item.date_created) : new Date(),
          clicks: item.clicks || 0,
        }))
        .sort((a, b) => b.dateRaw - a.dateRaw)
        .slice(0, URL_LIMIT);

      setUrls(transformedData);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setError(err.message);
      toast.error(err.message);

      if (
        err.message.includes("session has expired") ||
        err.message.includes("authentication") ||
        err.message.includes("No authentication token")
      ) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-UK", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/,/g, " -");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedUrls = () => {
    if (!sortField) return urls;

    return [...urls].sort((a, b) => {
      let aValue, bValue;

      if (sortField === "date") {
        aValue = a.dateRaw;
        bValue = b.dateRaw;
      } else if (sortField === "clicks") {
        aValue = a.clicks;
        bValue = b.clicks;
      } else {
        aValue = String(a[sortField]).toLowerCase();
        bValue = String(b[sortField]).toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 dark:text-slate-400 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 dark:**:text-slate-300" />
    ) : (
      <ChevronDown className="w-4 h-4 dark:text-slate-300" />
    );
  };

  // Handler to open QR modal
  const handleOpenQrModal = (linkKey, fullUrl) => {
    setSelectedShortLinkKey(linkKey);
    setSelectedShortUrl(fullUrl);
    setShowQrModal(true);
  };

  // Handler to close QR modal
  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setSelectedShortLinkKey(null);
    setSelectedShortUrl(null);
  };

  // Footer component that will always be shown
  const Footer = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md dark:bg-slate-900/70 bg-gray-200 border-t border-slate-700/50">
      <div className="text-center py-4 px-4">
        <span className="dark:text-slate-300 text-sm">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
              >
                Sign In
              </button>{" "}
              to manage your URLs and view history
            </>
          ) : (
            <span>
              Check{" "}
              <a href="/dashboard" className="text-blue-400 underline">
                Dashboard
              </a>{" "}
              for Unlimited History
            </span>
          )}
        </span>
      </div>
    </div>
  );

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = () => {
    if (isLoggedIn) {
      fetchUrls();
    } else {
      navigate("/login");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Calculate URLs remaining
  const urlsRemaining = Math.max(0, URL_LIMIT - urls.length);

  // --- Render Logic ---

  // Scenario 1: Initial fake loading for unauthenticated users
  if (showInitialSkeletonAndRedirect && !isLoggedIn) {
    return (
      <div className="w-full bg-transparent p-4 sm:p-6 min-h-full">
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-slate-200">
              Your Top URLs
            </h2>
            {/* Refresh button is still visible during fake load */}
            <button
              onClick={handleRefresh}
              className="py-1 text-sm cursor-pointer text-blue-500 rounded transition-colors"
            >
              <RefreshCcw className="animate-spin" />
            </button>
          </div>

          <div className="dark:bg-slate-800 rounded-lg overflow-hidden mb-20">
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <div className="max-h-75 overflow-y-auto">
                  <table className="w-full backdrop-blur-2xl">
                    <thead className="bg-gray-300 dark:bg-slate-700 sticky top-0 z-10">
                      <tr>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                          Short Link
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                          Original Link
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                          QR Code
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide cursor-pointer transition-colors select-none">
                          <div className="flex items-center gap-1">
                            Date
                            <ChevronUp className="w-4 h-4 dark:text-slate-400 opacity-50" />
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide cursor-pointer transition-colors select-none">
                          <div className="flex items-center gap-1">
                            Clicks
                            <ChevronUp className="w-4 h-4 dark:text-slate-400 opacity-50" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {[...Array(5)].map((_, index) => (
                        <SkeletonTableRow key={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:hidden backdrop-blur-2xl">
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-4 p-4 pb-20">
                {[...Array(3)].map((_, index) => (
                  <SkeletonMobileCard key={index} />
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // Scenario 2: User is logged in and data is loading (real fetch)
  if (loading && isLoggedIn) {
    return (
      <div className="w-full bg-transparent p-4 sm:p-6 min-h-full">
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-slate-200">
              Your Top URLs
            </h2>
            <button
              onClick={handleRefresh}
              className="py-1 text-sm cursor-pointer text-blue-500 rounded transition-colors"
            >
              <RefreshCcw className="animate-spin" />
            </button>
          </div>

          <div className="dark:bg-slate-800 rounded-lg overflow-hidden mb-20">
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <div className="max-h-75 overflow-y-auto">
                  <table className="w-full backdrop-blur-2xl">
                    <thead className="bg-gray-300 dark:bg-slate-700 sticky top-0 z-10">
                      <tr>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                          Short Link
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                          Original Link
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                          QR Code
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide cursor-pointer transition-colors select-none">
                          <div className="flex items-center gap-1">
                            Date
                            <ChevronUp className="w-4 h-4 dark:text-slate-400 opacity-50" />
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide cursor-pointer transition-colors select-none">
                          <div className="flex items-center gap-1">
                            Clicks
                            <ChevronUp className="w-4 h-4 dark:text-slate-400 opacity-50" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {[...Array(5)].map((_, index) => (
                        <SkeletonTableRow key={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:hidden backdrop-blur-2xl">
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-4 p-4 pb-20">
                {[...Array(3)].map((_, index) => (
                  <SkeletonMobileCard key={index} />
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // Scenario 3: Error occurred during fetch (and user was initially logged in or tried to refresh)
  if (error) {
    return (
      <div className="w-full bg-transparent p-4 sm:p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="flex items-center gap-2 dark:text-red-400 justify-center">
                <AlertCircle size={20} />
                <span>Error loading URLs</span>
              </div>
              <p className="dark:text-slate-400 text-sm">{error}</p>

              <div className="flex gap-2 justify-center">
                {error.includes("session has expired") ||
                error.includes("authentication") ||
                error.includes("No authentication token") ? (
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Log In
                  </button>
                ) : (
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Scenario 4: Not loading, no error, and user is logged in (display actual data)
  const sortedUrls = getSortedUrls();

  return (
    <div className="w-full bg-transparent p-4 sm:p-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-slate-200 text-slate-700">
            {urls.length === URL_LIMIT
              ? `Your Top (${URL_LIMIT}) URLs (Limit Reached)`
              : `Your Top (${urls.length}) URLs (${urlsRemaining} of ${URL_LIMIT} left)`}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="py-1 text-sm cursor-pointer text-blue-500 rounded transition-colors"
            >
              <RefreshCcw />
            </button>
          </div>
        </div>

        {/* Show empty state if no URLs */}
        {urls.length === 0 ? (
          <div className="text-center py-12">
            <p className="dark:text-slate-400 text-lg mb-4">No URLs found</p>
            <p className="dark:text-slate-500 text-sm">
              Create your first shortened URL to see it here.
            </p>
          </div>
        ) : (
          <>
            {/* Table Container with mobile responsiveness */}
            <div className="dark:bg-slate-800 rounded-lg overflow-hidden mb-20">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <div className="max-h-75 overflow-y-auto">
                    <table className="w-full backdrop-blur-2xl">
                      <thead className="bg-gray-300 dark:bg-slate-700 sticky top-0 z-10">
                        <tr>
                          <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                            Short Link
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                            Original Link
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                            QR Code
                          </th>
                          <th
                            className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide cursor-pointer transition-colors select-none"
                            onClick={() => handleSort("date")}
                          >
                            <div className="flex items-center gap-1">
                              Date
                              <SortIcon field="date" />
                            </div>
                          </th>
                          <th
                            className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide cursor-pointer transition-colors select-none"
                            onClick={() => handleSort("clicks")}
                          >
                            <div className="flex items-center gap-1">
                              Clicks
                              <SortIcon field="clicks" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {sortedUrls.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-750 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 text-sm">
                                  {item.shortUrl}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopy(item.shortUrl, item.id)
                                  }
                                  className="cursor-pointer hover:text-blue-400 text-slate-400 transition-colors"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="dark:text-slate-300 text-sm truncate max-w-xs">
                                  {item.target_url}
                                </span>
                              </div>
                            </td>
                            {/* QR Code Cell - Now a button */}
                            <td className="py-4 px-4">
                              <button
                                onClick={() =>
                                  handleOpenQrModal(item.key, item.shortUrl)
                                }
                                className="flex items-center justify-center w-8 h-8 dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-600 transition-colors group"
                                aria-label={`Show QR code for ${item.shortUrl}`}
                              >
                                <QrCode
                                  size={16}
                                  className="dark:text-slate-300 group-hover:text-blue-400 transition-colors"
                                />
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <span className="dark:text-slate-400 text-sm">
                                {item.date}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="dark:text-slate-400 text-sm">
                                {item.clicks}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden backdrop-blur-2xl">
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-4 p-4 pb-20">
                  {sortedUrls.map((item) => (
                    <div
                      key={item.id}
                      className="dark:bg-slate-700 rounded-lg p-4 space-y-3"
                    >
                      {/* Header with platform icon and status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* QR code button for mobile card */}
                          <button
                            onClick={() =>
                              handleOpenQrModal(item.key, item.shortUrl)
                            }
                            className="flex items-center justify-center w-7 h-7 dark:bg-slate-600 rounded cursor-pointer hover:bg-slate-500 transition-colors group"
                            aria-label={`Show QR code for ${item.shortUrl}`}
                          >
                            <QrCode
                              size={14}
                              className="dark:text-slate-300 group-hover:text-blue-400 transition-colors"
                            />
                          </button>
                          {/* External Link icon: Ensure it's not too large */}
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer flex-shrink-0"
                            aria-label={`Visit ${item.shortUrl}`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        {/* Clicks count: Use text-xs for small screens */}
                        <span className="text-xs dark:text-slate-400 flex-shrink-0">
                          {item.clicks} clicks
                        </span>
                      </div>

                      {/* Short URL */}
                      <div className="space-y-1">
                        <label className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
                          Short Link
                        </label>
                        <div className="flex items-center gap-2">
                          {/* Added flex-auto to allow text to take available space and break */}
                          <span className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm break-all flex-auto min-w-0">
                            {item.shortUrl}
                          </span>
                          {/* Copy button: Ensure it doesn't push the URL off screen */}
                          <button
                            onClick={() => handleCopy(item.shortUrl, item.id)}
                            className="dark:text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Original URL */}
                      <div className="space-y-1">
                        <label className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
                          Original Link
                        </label>
                        {/* Added min-w-0 to ensure it can shrink, and truncate for very long URLs */}
                        <span className="dark:text-slate-300 text-sm break-all block min-w-0">
                          {item.target_url}
                        </span>
                      </div>

                      {/* Stats row */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                        <div className="text-center">
                          <div className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
                            Date
                          </div>
                        </div>
                        <div className="dark:text-slate-400 text-sm">
                          {item.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fixed Footer with Frosted Glass Effect - Always shown */}
        <Footer />
      </div>

      {/* Render QR Code Modal conditionally */}
      {showQrModal && (
        <QrCodeModal
          shortLinkKey={selectedShortLinkKey}
          shortUrl={selectedShortUrl}
          onClose={handleCloseQrModal}
        />
      )}
    </div>
  );
};

export default UrlTable;
