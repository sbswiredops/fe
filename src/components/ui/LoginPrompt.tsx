"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function LoginPrompt({
  isOpen,
  onClose,
  redirectUrl = "/courses",
}: LoginPromptProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/login?next=${encodeURIComponent(redirectUrl)}`);
    onClose();
  };

  const handleSignUp = () => {
    router.push(`/login?mode=register&next=${encodeURIComponent(redirectUrl)}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <LogIn className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Login Required
        </h3>
        <p className="text-gray-600 mb-6">
          You need to be logged in to preview this content. Login to your account
          or create a new one to get started.
        </p>
        <div className="space-y-3">
          <Button
            onClick={handleLogin}
            className="w-full text-white"
            size="lg"
            style={{
              backgroundColor: "var(--color-text-primary)",
              borderColor: "var(--color-text-primary)",
            }}
          >
            Login
          </Button>
          <Button
            onClick={handleSignUp}
            className="w-full text-blue-600 border border-blue-600 bg-white hover:bg-blue-50"
            size="lg"
          >
            Create Account
          </Button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
