import {
  Copy,
  ExternalLink,
  Trash2,
  Link,
  Loader2,
  AlertCircle,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  QrCode, // Import QrCode icon
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import QrCodeModal from "./QrCodeModal";

// --- Helper Functions ---
const handleAuthenticationError = (navigate, toast) => {
  localStorage.removeItem("access_token");
  toast.error("Your session has expired. Redirecting to login...");
  setTimeout(() => {
    localStorage.setItem("redirect_after_login", window.location.pathname);
    navigate("/login");
  }, 2000);
};

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
  <tr className="hover:bg-slate-750 transition-colors border-b border-slate-700">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonLine width="w-32" height="h-4" />
      </div>
    </td>
    <td className="p-4">
      <SkeletonLine width="w-48" height="h-4" />
    </td>
    <td className="p-4">
      <SkeletonLine width="w-12" height="h-4" />
    </td>
    <td className="p-4">
      <SkeletonLine width="w-20" height="h-4" />
    </td>
    <td className="p-4">
      <SkeletonLine width="w-24" height="h-4" />
    </td>
    {/* Add skeleton for QR Code column */}
    <td className="p-4">
      <SkeletonCircle size="w-8 h-8" />
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-8 h-8" />
      </div>
    </td>
  </tr>
);

const SkeletonMobileCard = () => (
  <div className="dark:bg-slate-700 rounded-lg p-4 space-y-3">
    {/* Header with platform icon and short link */}
    <div className="flex items-center gap-3 mb-3">
      <SkeletonCircle size="w-8 h-8" />
      <SkeletonLine width="w-40" height="h-4" />
    </div>

    {/* Clicks and Status */}
    <div className="flex items-center justify-between">
      <SkeletonLine width="w-24" height="h-4" />
      <SkeletonLine width="w-20" height="h-4" />
    </div>

    {/* Original URL */}
    <div className="space-y-1">
      <label className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
        Original Link
      </label>
      <SkeletonLine width="w-full" height="h-4" />
    </div>

    {/* Date and Actions */}
    <div className="flex items-center justify-between pt-2 border-t border-slate-600">
      <SkeletonLine width="w-24" height="h-4" />
      <div className="flex items-center gap-1">
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-8 h-8" />
        <SkeletonCircle size="w-8 h-8" /> {/* Skeleton for QR code button */}
      </div>
    </div>
  </div>
);
// --- End Skeleton Components ---

// MODIFICATION START: Accept refreshTrigger prop
const LinkHistory = ({ onCopyLink, onDeleteLink, refreshTrigger }) => {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // State for QR Code Modal
  const [qrCodeModalData, setQrCodeModalData] = useState(null); // { shortLinkKey, shortUrl }

  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
      fetchLinks();
    } else {
      setIsLoggedIn(false);
      setLoading(false); // Immediately set loading to false if not logged in
      setError("Please log in to view your links."); // More direct message
    }
  }, [refreshTrigger]); // MODIFICATION: Add refreshTrigger to dependency array

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(`https://shorter-umber.vercel.app/urls`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleAuthenticationError(navigate, toast); // Use helper
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transformedLinks = data.map((item, index) => ({
        id: item.id || item.key || index + 1,
        shortUrl: `https://shorter-umber.vercel.app/s/${item.key}`,
        originalUrl: item.original_url || item.target_url,
        clicks: item.clicks || 0,
        status: "Active",
        date: item.date_created || new Date().toISOString(),
        dateRaw: item.date_created ? new Date(item.date_created) : new Date(),
        favicon: null,
        key: item.key, // Ensure key is captured for QR Code modal
        secretKey: item.secret_key, // Ensure secret_key is captured for deletion
      }));

      setLinks(transformedLinks);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Error fetching links:", err);
      setError(err.message);

      if (!err.message.includes("session has expired")) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(shortUrl);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);

      if (onCopyLink) {
        onCopyLink(shortUrl);
      }
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Modified handleDeleteLink to accept the secretKey directly
  const handleDeleteLink = async (linkId, secretKey) => {
    try {
      setDeletingId(linkId);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // No need to find the link by ID from `links` state here
      // as `secretKey` is now directly passed.
      if (!secretKey) {
        throw new Error("Secret key is missing for deletion.");
      }

      // API call to delete the link using its 'secret_key'
      const response = await fetch(
        `https://shorter-umber.vercel.app/delete/${secretKey}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleAuthenticationError(navigate, toast); // Use helper
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        // Attempt to read error message from response body
        const errorData = await response.json().catch(() => ({
          message: `Failed to delete link: ${response.status}`,
        }));
        throw new Error(
          errorData.message || `Failed to delete link: ${response.status}`
        );
      }

      // If successful, filter out the deleted link from the state
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== linkId));
      toast.success("Link deleted successfully!");

      if (onDeleteLink) {
        onDeleteLink(linkId);
      }
    } catch (err) {
      console.error("Error deleting link:", err);

      if (!err.message.includes("session has expired")) {
        toast.error(err.message);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    fetchLinks();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedLinks = () => {
    if (!sortField) return links;

    return [...links].sort((a, b) => {
      let aValue, bValue;

      if (sortField === "date") {
        aValue = a.dateRaw;
        bValue = b.dateRaw;
      } else if (sortField === "clicks") {
        aValue = a.clicks;
        bValue = b.clicks;
      } else {
        // Fallback for other fields if needed, e.g., string comparison
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
      <ChevronUp className="w-4 h-4 dark:text-slate-300" />
    ) : (
      <ChevronDown className="w-4 h-4 dark:text-slate-300" />
    );
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "text-green-400" : "text-yellow-400";
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

  const handleLogin = () => {
    handleAuthenticationError(navigate, toast);
  };

  // Function to open QR Code modal
  const openQrCodeModal = (shortLinkKey, shortUrl) => {
    setQrCodeModalData({ shortLinkKey, shortUrl });
  };

  // Function to close QR Code modal
  const closeQrCodeModal = () => {
    setQrCodeModalData(null);
  };

  if (loading) {
    return (
      <div className="dark:bg-slate-800 backdrop-blur-2xl rounded-lg border border-slate-700 flex flex-col h-full max-h-[600px]">
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
        {/* Fixed Header */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold dark:text-white">History</h2>
              <SkeletonLine width="w-8" height="h-4" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="py-1 text-sm cursor-pointer text-blue-500 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCcw className="animate-spin" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content with Skeleton Loaders */}
        <div className="flex-1 overflow-y-auto">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="dark:bg-slate-700/50 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                    Short Link
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                    Original Link
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                    Clicks
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide truncate">
                    QR Code {/* New Header for QR Code */}
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <SkeletonTableRow key={index} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {[...Array(3)].map((_, index) => (
              <SkeletonMobileCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  // --- End: Render skeleton components during loading ---

  // Error or Not Logged In state
  if (error || !isLoggedIn) {
    return (
      <div className="dark:bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-full max-h-[600px] pb-5">
        <div className="p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-semibold dark:text-white">History</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center pt-3 space-y-4">
            <div className="flex items-center gap-2 text-red-400 justify-center">
              <AlertCircle size={20} />
              <span>{error || "Please log in to view your links."}</span>
            </div>
            <p className="text-slate-400 text-sm">
              {isLoggedIn
                ? "There was an issue fetching your links. Please try again."
                : "You need to be logged in to access your link history."}
            </p>
            <div className="flex gap-2 justify-center">
              {!isLoggedIn ||
              error.includes("session has expired") ||
              error.includes("authentication") ? (
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
    );
  }

  const sortedLinks = getSortedLinks();

  return (
    <div className="backdrop-blur-2xl dark:bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-full max-h-[600px]">
      {/* Fixed Header */}
      <div className=" p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold dark:text-white">
            History ({links.length})
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="py-1 text-sm cursor-pointer text-blue-500 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCcw className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Show empty state if no URLs after loading */}
        {links.length === 0 && !loading && !error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link size={24} className="dark:text-slate-400" />
            </div>
            <h3 className="dark:text-slate-300 font-medium mb-2">
              No links yet
            </h3>
            <p className="dark:text-slate-400 text-slate-500 text-sm ">
              Start by creating your first shortened link
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-300 dark:bg-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                      Short Link
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                      Original Link
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                      <button
                        onClick={() => handleSort("clicks")}
                        className="flex items-center gap-1 group rounded uppercase"
                      >
                        Clicks
                        <SortIcon field="clicks" />
                      </button>
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                      <button
                        onClick={() => handleSort("date")}
                        className="flex items-center gap-1 group rounded uppercase"
                      >
                        Date
                        <SortIcon field="date" />
                      </button>
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide truncate">
                      QR Code {/* New Header */}
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold dark:text-slate-300 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLinks.map((link) => (
                    <tr key={link.id} className="border-b border-slate-700">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded flex items-center justify-center">
                            <Link size={16} className="dark:text-slate-300" />
                          </div>
                          <span className="text-blue-400 font-mono text-sm break-all">
                            {link.shortUrl}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 max-w-md">
                          <span className="dark:text-slate-300 text-sm truncate">
                            {link.originalUrl}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="dark:text-white font-medium">
                          {link.clicks}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${getStatusColor(
                            link.status
                          )}`}
                        >
                          {link.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="dark:text-slate-300 truncate">
                          {formatDate(link.date)}
                        </span>
                      </td>
                      <td className="p-4">
                        {/* QR Code Button for Desktop */}
                        <button
                          onClick={() =>
                            openQrCodeModal(link.key, link.shortUrl)
                          }
                          className="p-2 dark:text-slate-400 hover:text-purple-400 rounded transition-colors"
                          title="View QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(link.shortUrl)}
                            className={`p-2 transition-colors rounded ${
                              copiedId === link.shortUrl
                                ? "text-green-400 bg-slate-700"
                                : "dark:text-slate-400 hover:text-blue-400"
                            }`}
                            title="Copy link"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() =>
                              window.open(link.originalUrl, "_blank")
                            }
                            className="p-2 dark:text-slate-400 hover:text-green-400 rounded transition-colors"
                            title="Visit original"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteLink(link.id, link.secretKey)
                            } // Pass link.secretKey here
                            disabled={deletingId === link.id}
                            className={`p-2 rounded transition-colors ${
                              deletingId === link.id
                                ? "text-slate-500 cursor-not-allowed"
                                : "dark:text-slate-400 hover:text-red-400"
                            }`}
                            title="Delete"
                          >
                            {deletingId === link.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {sortedLinks.map((link, index) => (
                <div
                  key={link.id}
                  className={`p-4 dark:bg-slate-700 rounded-lg space-y-3`}
                >
                  {/* Short Link Header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0">
                        <Link size={16} className="dark:text-slate-300" />
                      </div>
                      <span className="text-blue-400 font-mono text-sm break-all">
                        {link.shortUrl}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">
                        {link.clicks} click(s)
                      </span>
                      <span
                        className={`font-medium text-sm ${getStatusColor(
                          link.status
                        )}`}
                      >
                        {link.status}
                      </span>
                    </div>
                  </div>

                  {/* Original URL */}
                  <div className="space-y-1">
                    <label className="text-xs dark:text-slate-400 uppercase tracking-wide font-semibold">
                      Original URL
                    </label>
                    <p className="dark:text-slate-300 text-slate-600 text-sm break-all">
                      {link.originalUrl}
                    </p>
                  </div>

                  {/* Date and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t dark:border-slate-600">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      {formatDate(link.date)}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* QR Code Button for Mobile */}
                      <button
                        onClick={() => openQrCodeModal(link.key, link.shortUrl)}
                        className="p-2 dark:text-slate-400 hover:text-purple-400 rounded transition-colors"
                        title="View QR Code"
                      >
                        <QrCode size={16} />
                      </button>
                      <button
                        onClick={() => handleCopyLink(link.shortUrl)}
                        className={`p-2 transition-colors rounded ${
                          copiedId === link.shortUrl
                            ? "text-green-400 bg-slate-700"
                            : "dark:text-slate-400 hover:text-blue-400"
                        }`}
                        title="Copy link"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => window.open(link.originalUrl, "_blank")}
                        className="p-2 dark:text-slate-400 hover:text-green-400 rounded transition-colors"
                        title="Visit original"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteLink(link.id, link.secretKey)
                        } // Pass link.secretKey here
                        disabled={deletingId === link.id}
                        className={`p-2 rounded transition-colors ${
                          deletingId === link.id
                            ? "text-slate-500 cursor-not-allowed"
                            : "dark:text-slate-400 hover:text-red-400"
                        }`}
                        title="Delete"
                      >
                        {deletingId === link.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {qrCodeModalData && (
        <QrCodeModal
          shortLinkKey={qrCodeModalData.shortLinkKey}
          shortUrl={qrCodeModalData.shortUrl}
          onClose={closeQrCodeModal}
        />
      )}
    </div>
  );
};

export default LinkHistory;
