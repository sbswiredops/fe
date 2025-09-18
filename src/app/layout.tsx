import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import HMRErrorHandler from "@/components/HRMErrorHandler";
import { LanguageProvider } from "@/components/contexts/LanguageContext";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { EnrolledCoursesProvider } from "@/components/contexts/EnrolledCoursesContext";
;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shekhabo - Master Your Career",
  description: "Join thousands of professionals learning job-ready skills through expert-led courses and live interactive classes on Shekhabo.",
  keywords: "online education, courses, live classes, job skills, career development, professional training",
  authors: [{ name: "Shekhabo Team" }],
  openGraph: {
    title: "Shekhabo - Master Your Career",
    description: "Join thousands of professionals learning job-ready skills through expert-led courses and live interactive classes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shekhabo - Master Your Career",
    description: "Join thousands of professionals learning job-ready skills through expert-left courses and live interactive classes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <HMRErrorHandler />
          <LanguageProvider>
            <AuthProvider>
              <EnrolledCoursesProvider>
                {children}
              </EnrolledCoursesProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
