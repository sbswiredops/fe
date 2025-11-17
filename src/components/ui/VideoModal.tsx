"use client";

import React from "react";
import Modal from "./Modal";

const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : null;
};

const getCloudflareId = (url: string) => {
  let match = url.match(/videodelivery\.net\/([a-zA-Z0-9]+)/);
  if (match) return match[1];

  match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/);
  if (match) return match[1];

  return null;
};

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = "Video Preview",
}: VideoModalProps) {
  const youtubeId = getYouTubeId(videoUrl);
  const cloudflareId = getCloudflareId(videoUrl);

  let player = null;

  // YouTube Player (Auto-play)
  if (youtubeId) {
    player = (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  // Cloudflare Stream Player (Auto-play)
  else if (cloudflareId) {
    player = (
      <iframe
        src={`https://iframe.videodelivery.net/${cloudflareId}?autoplay=1&muted=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }
  // Invalid URL
  else {
    player = (
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Invalid or unsupported video URL</p>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        {player}
      </div>
    </Modal>
  );
}
