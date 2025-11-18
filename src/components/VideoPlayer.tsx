"use client";

import React, { useEffect, useRef, useState } from "react";
import HLS from "hls.js";

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  onError?: (error: Error) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = "w-full h-full object-contain",
  autoPlay = true,
  controls = true,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    try {
      if (src.endsWith(".m3u8")) {
        if (HLS.isSupported()) {
          const hls = new HLS();
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(HLS.Events.MANIFEST_PARSED, () => {
            if (autoPlay) {
              video.play().catch((err) => {
                console.warn("Auto-play prevented:", err);
              });
            }
          });

          hls.on(HLS.Events.ERROR, (event, data) => {
            if (data.fatal) {
              const errorMsg = `HLS Error: ${data.type} - ${data.reason}`;
              setError(errorMsg);
              onError?.(new Error(errorMsg));
            }
          });

          return () => {
            hls.destroy();
          };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          if (autoPlay) {
            video.play().catch((err) => {
              console.warn("Auto-play prevented:", err);
            });
          }
        } else {
          const errorMsg = "HLS streams are not supported in this browser";
          setError(errorMsg);
          onError?.(new Error(errorMsg));
        }
      } else {
        video.src = src;
        if (autoPlay) {
          video.play().catch((err) => {
            console.warn("Auto-play prevented:", err);
          });
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load video";
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  }, [src, autoPlay, onError]);

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
              d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a4.5 4.5 0 100 9H15a2 2 0 01-2-2v-.5a4.5 4.5 0 10-9 0V15a2 2 0 01-2 2H2.5a4.5 4.5 0 100-9H3a2 2 0 012-2h.5A4.5 4.5 0 0112 7z"
            />
          </svg>
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls={controls}
      controlsList="nodownload"
      className={className}
    />
  );
};

export default VideoPlayer;
