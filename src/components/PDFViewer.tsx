"use client";

import React, { useEffect, useRef, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
  className?: string;
  onError?: (error: Error) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  className = "w-full h-full",
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pdfUrl) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);
    setError(null);

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      const errorMsg = "Failed to load PDF document";
      setError(errorMsg);
      setIsLoading(false);
      onError?.(new Error(errorMsg));
    };

    iframe.addEventListener("load", handleLoad);
    iframe.addEventListener("error", handleError);

    iframe.src = pdfUrl;

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.removeEventListener("error", handleError);
    };
  }, [pdfUrl, onError]);

  if (error) {
    return (
      <div className={`${className} bg-red-50 flex items-center justify-center`}>
        <div className="text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-red-700 font-medium text-sm">{error}</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 underline text-xs mt-2 inline-block"
          >
            Open in new tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className={className}
        title="PDF Viewer"
        style={{
          border: "none",
          display: isLoading ? "none" : "block",
        }}
      />
    </>
  );
};

export default PDFViewer;
