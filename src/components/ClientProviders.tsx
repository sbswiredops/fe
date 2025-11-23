"use client";
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import HMRErrorHandler from "@/components/HRMErrorHandler";
import { LanguageProvider } from "@/components/contexts/LanguageContext";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { EnrolledCoursesProvider } from "@/components/contexts/EnrolledCoursesContext";
import { ToastContainer } from "react-toastify";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // IMPORTANT: do not render different DOM on first render.
  // Keep this component as a pure provider wrapper (no conditional markup).
  return (
    <>
      <ErrorBoundary>
        <HMRErrorHandler />
        <LanguageProvider>
          <AuthProvider>
            <EnrolledCoursesProvider>
              {children}
              <ToastContainer position="top-right" autoClose={3000} />
            </EnrolledCoursesProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </>
  );
}
