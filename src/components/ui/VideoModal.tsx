"use client";

import React from "react";
import Modal from "./Modal";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : null;
};

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = "Video Preview",
}: VideoModalProps) {
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
        <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Invalid video URL</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Modal>
  );
}
