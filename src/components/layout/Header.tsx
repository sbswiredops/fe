/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import AuthDrawer from "../auth/AuthDrawer";
import { useRouter } from "next/navigation";

export default function Header() {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authDrawerMode, setAuthDrawerMode] = useState<"login" | "register">(
    "login",
  );

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.courses"), href: "/courses" },
    // { name: t("nav.liveClasses"), href: "/live-classes" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  const displayName = (() => {
    const u: any = user as any;
    const primary =
      typeof u?.name === "string" && u.name.trim() ? u.name.trim() : "";
    const secondary =
      typeof u?.email === "string" && u.email.trim() ? u.email.trim() : "";
    const roleStr =
      typeof u?.role === "string"
        ? u.role
        : typeof u?.role?.name === "string"
          ? u.role.name
          : "";
    return primary || secondary || roleStr || "";
  })();
  const displayInitial = displayName ? displayName[0].toUpperCase() : "";

  const avatarUrl =
    (user as any)?.avatar || (user as any)?.profileImage || null;

  // Role-based dashboard redirect handler
  const handleDashboardRedirect = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    // 1s wait (optional)
    await new Promise((res) => setTimeout(res, 1000));
    let roleValue = "";
    if (user) {
      roleValue =
        typeof (user as any).role === "string"
          ? (user as any).role
          : String((user as any).role?.name || "")
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, "_");
    }
    if (
      [
        "admin",
        "super_admin",
        "sales_marketing",
        "finance_accountant",
        "content_creator",
      ].includes(roleValue)
    ) {
      router.push("/dashboard/admin");
    } else if (["teacher", "instructor"].includes(roleValue)) {
      router.push("/dashboard/teacher");
    } else if (roleValue === "student") {
      router.push("/dashboard/student");
    } else {
      router.push("/");
    }
  };

  // Logout handler with delay
  const handleLogout = async () => {
    await new Promise((res) => setTimeout(res, 1000));
    logout();
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Shekhabo Logo"
                className="w-30 h-30 md:w-32 md:h-32 sm:w-16 sm:h-16 object-contain" // Responsive logo size
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8 overflow-x-auto max-w-[60vw]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-[color:#51356e] font-medium transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Language Switcher and Auth */}
          <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() =>
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white shadow transition-colors hover:shadow-md focus:outline-none whitespace-nowrap h-8"
              >
                {/* Show only language name */}
                <span className="text-[13px] font-medium text-gray-700 truncate">
                  {currentLanguage.name}
                </span>

                <svg
                  className={`w-3 h-3 transition-transform text-gray-500 ${
                    isLanguageDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-max min-w-[120px] bg-white rounded-md shadow border border-gray-200 p-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLanguage(language);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 rounded-md flex items-center gap-2 whitespace-nowrap ${
                        currentLanguage.code === language.code
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="truncate">{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons / User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={displayName || "User avatar"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {displayInitial}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{displayName || "User"}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-3 py-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-left"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            handleDashboardRedirect();
                          }}
                        >
                          {t("nav.dashboard")}
                        </Button>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  size="sm"
                  className="h-8 w-22"
                  onClick={() => {
                    setAuthDrawerMode("login");
                    setIsAuthDrawerOpen(true);
                  }}
                >
                  {t("nav.login")}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-[color:#51356e] font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName || "User avatar"}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {displayInitial}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {displayName || "User"}
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={handleDashboardRedirect}
                      >
                        {t("nav.dashboard")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setAuthDrawerMode("login");
                      setIsAuthDrawerOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Auth Drawer */}
      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
        initialMode={authDrawerMode}
      />
    </header>
  );
}
