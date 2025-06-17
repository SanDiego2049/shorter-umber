// src/components/UrlForm.jsx
import { useState } from "react";
import { shortenUrl } from "../lib/urlApi";
import { toast } from "react-hot-toast";
import { Link, ArrowRight } from "lucide-react";

const UrlForm = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return toast.error("Please enter a valid URL");

    toast.loading("Shortening...", { id: "shorten" });

    try {
      const data = await shortenUrl(url);
      setResult(data);
      toast.success("URL shortened!", { id: "shorten" });
    } catch (err) {
      toast.error(err, { id: "shorten" });
    }
  };

  return (
    <div className="mt-6 w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-gray-800 rounded-full border border-gray-600 px-4 py-3">
          <Link className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="url"
            placeholder="Enter the link here"
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Shorten</span>
            <ArrowRight className="w-5 h-5 sm:hidden" />
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-800">Short URL:</p>
          <a
            href={result.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {result.short_url}
          </a>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
