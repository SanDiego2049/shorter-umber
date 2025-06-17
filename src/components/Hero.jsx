import { useState, useEffect } from "react";
import { Link, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const Hero = () => {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [autoPaste, setAutoPaste] = useState(true);
  const [isShortening, setIsShortening] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  // Auto-paste from clipboard functionality
  useEffect(() => {
    if (autoPaste) {
      const handlePaste = async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            // Check if clipboard contains a URL
            if (
              clipboardText &&
              (clipboardText.startsWith("http://") ||
                clipboardText.startsWith("https://"))
            ) {
              setUrl(clipboardText);
            }
          }
        } catch (error) {
          // Silently fail if clipboard access is denied
          console.log("Clipboard access denied or not supported");
        }
      };

      // Auto-paste on focus if enabled
      const handleFocus = () => {
        if (autoPaste && !url) {
          handlePaste();
        }
      };

      const inputElement = document.querySelector('input[type="url"]');
      if (inputElement) {
        inputElement.addEventListener("focus", handleFocus);
        return () => inputElement.removeEventListener("focus", handleFocus);
      }
    }
  }, [autoPaste, url]);

  const validateUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const shortenUrl = async (targetUrl) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login to shorten URLs");
      navigate("/login");
      return null;
    }

    try {
      const response = await fetch("https://shorter-umber.vercel.app/url", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_url: targetUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return null;
      } else if (response.status === 400) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Invalid URL provided");
        return null;
      } else if (response.status === 429) {
        toast.error("Rate limit exceeded. Please try again later.");
        return null;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Failed to shorten URL");
        return null;
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error("Network error. Please check your connection.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (!validateUrl(url.trim())) {
      toast.error(
        "Please enter a valid URL (must start with http:// or https://)"
      );
      return;
    }

    setIsShortening(true);

    try {
      const data = await shortenUrl(url.trim());

      if (data) {
        if (data.links_remaining !== undefined) {
          setLinksRemaining(data.links_remaining);
        } else {
          setLinksRemaining((prev) => Math.max(0, prev - 1));
        }

        toast.success("URL shortened successfully!");
        setUrl("");
      }
    } finally {
      setIsShortening(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <section className="h-full mt-10 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="">
        {/* Main Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-xl">
            <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
              Shorten Your Loooong Links
            </span>
          </h1>

          <p className="mt-6 text-md sm:text-xl text-gray-800 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Umber is an efficient and easy-to-use URL shortening service that
            streamlines your online experience.
          </p>
        </div>

        {/* URL Form */}
        <div className="w-full max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <div className="flex items-center dark:bg-gray-800/80 backdrop-blur-2xl rounded-full border border-gray-600/50 p-2 sm:p-3 shadow-2xl">
                <Link className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-4 mr-3 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="Enter the link here"
                  className="flex-1 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base px-2"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isShortening}
                  required
                />
                <button
                  type="submit"
                  disabled={isShortening || !url.trim()}
                  className="cursor-pointer ml-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white p-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-blue-500/25 flex-shrink-0"
                >
                  {isShortening ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline text-sm sm:text-base px-2">
                        Shortening...
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="hidden sm:inline text-sm sm:text-base px-4">
                        Shorten
                      </span>
                      <ArrowRight className="w-4 h-4 sm:hidden" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Auto Paste Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex items-center gap-3 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                type="button"
                onClick={() => setAutoPaste(!autoPaste)}
                className={`cursor-pointer relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  autoPaste ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    autoPaste ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </button>
              <span className="dark:text-gray-300 text-gray-800 text-sm font-medium">
                Auto Paste from Clipboard
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
