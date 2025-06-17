import React, { useState, useEffect } from "react";
import { X, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";

const QrCodeModal = ({ shortLinkKey, onClose, shortUrl }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [errorQr, setErrorQr] = useState(null);

  useEffect(() => {
    if (shortLinkKey) {
      const fetchQrCode = async () => {
        setLoadingQr(true);
        setErrorQr(null);
        setQrCodeDataUrl(null); // Clear previous QR code

        try {
          const response = await fetch(
            `https://shorter-umber.vercel.app/qr/${shortLinkKey}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch QR code: ${response.statusText}`);
          }
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setQrCodeDataUrl(reader.result);
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          console.error("Error fetching QR code:", err);
          setErrorQr("Failed to load QR code. Please try again.");
          toast.error("Failed to load QR code.");
        } finally {
          setLoadingQr(false);
        }
      };
      fetchQrCode();
    }
  }, [shortLinkKey]);

  const handleDownload = () => {
    if (qrCodeDataUrl && shortLinkKey) {
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `linkly-qr-${shortLinkKey}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    } else {
      toast.error("QR code not available for download.");
    }
  };

  if (!shortLinkKey) return null; // Don't render if no key is provided

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative dark:bg-slate-800 bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm transform animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
          aria-label="Close QR code modal"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold dark:text-white mb-4 text-center">
          QR Code
        </h3>

        {loadingQr && (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 size={32} className="animate-spin text-blue-500 mb-2" />
            <p className="dark:text-slate-400">Loading QR code...</p>
          </div>
        )}

        {errorQr && (
          <div className="flex flex-col items-center justify-center h-40 text-red-500">
            <AlertCircle size={32} className="mb-2" />
            <p>{errorQr}</p>
          </div>
        )}

        {qrCodeDataUrl && !loadingQr && (
          <div className="flex flex-col items-center">
            <img
              src={qrCodeDataUrl}
              alt={`QR Code for ${shortUrl}`}
              className="w-48 h-48 sm:w-64 sm:h-64 object-contain mb-4 border border-slate-700 rounded-md p-1"
            />
            <p className="text-xs text-slate-500 mb-4 truncate w-full text-center">
              {shortUrl}
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Download size={16} className="mr-2" />
              Download QR Code
            </button>
          </div>
        )}
      </div>

      {/* Animations for modal */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default QrCodeModal;
