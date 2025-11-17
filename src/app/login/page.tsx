"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthDrawer from "@/components/auth/AuthDrawer";
import { useAuth } from "@/components/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const mode = (searchParams.get("mode") as "login" | "register") || "login";
  const nextUrlRef = useRef<string | null>(null);

  // Store next URL on mount
  useEffect(() => {
    const nextUrl = searchParams.get("next");
    if (nextUrl) {
      nextUrlRef.current = nextUrl;
    }
  }, [searchParams]);

  // Watch for successful authentication and redirect
  useEffect(() => {
    if (!isLoading && user) {
      const redirectTo = nextUrlRef.current || "/";
      router.push(redirectTo);
    }
  }, [user, isLoading, router]);

  const handleAuthDrawerClose = () => {
    setIsDrawerOpen(false);
    // Redirect back if drawer is closed without authentication
    setTimeout(() => {
      router.back();
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthDrawer
        isOpen={isDrawerOpen}
        onClose={handleAuthDrawerClose}
        initialMode={mode}
      />
    </div>
  );
}
