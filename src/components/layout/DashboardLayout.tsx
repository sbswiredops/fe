/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useMemo, useEffect, useRef, use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsLanguageDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLanguageDropdownOpen(false);
        setIsUserDropdownOpen(false);
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const ADMIN_ROLES = useMemo(
    () => [
      "admin",
      "super_admin",
      "sales_marketing",
      "finance_accountant",
      "content_creator",
    ],
    []
  );
  const TEACHER_ROLES = useMemo(() => ["teacher", "instructor"], []);

  const normalizeRole = (role: any) =>
    String(typeof role === "string" ? role : role?.name ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  const getRoleGroup = (
    role: any
  ): "admin" | "teacher" | "student" | "other" => {
    const r = normalizeRole(role);
    if (!r) return "other";
    if (ADMIN_ROLES.includes(r)) return "admin";
    if (TEACHER_ROLES.includes(r)) return "teacher";
    if (r === "student") return "student";
    return "other";
  };

  const roleLabel = useMemo(() => {
    if (!user?.role) return "";
    const r: any = user.role as any;
    if (typeof r === "string") return r;
    if (typeof r?.name === "string" && r.name) return r.name;
    return normalizeRole(r);
  }, [user]);

  const displayName = useMemo(() => {
    const primary = user?.name && String(user.name).trim();
    const secondary = user?.email && String(user.email).trim();
    return primary || secondary || roleLabel || "User";
  }, [user, roleLabel]);

  const displayInitial = useMemo(
    () => String(displayName).trim()?.[0]?.toUpperCase() || "U",
    [displayName]
  );

  const navigationItems = useMemo(() => {
    if (!user) return [];
    const roleGroup = getRoleGroup(user.role);
    const basePath =
      roleGroup === "admin"
        ? "/dashboard/admin"
        : roleGroup === "teacher"
        ? "/dashboard/teacher"
        : roleGroup === "student"
        ? "/dashboard/student"
        : "/dashboard";

    const commonItems = [{ name: "Dashboard", href: basePath, icon: "🏠" }];

    switch (roleGroup) {
      case "admin":
        return [
          ...commonItems,
          { name: "Users", href: `${basePath}/users`, icon: "👥" },
          { name: "Employees", href: `${basePath}/employees`, icon: "👨‍💼" },
          { name: "Courses", href: `${basePath}/courses`, icon: "📚" },
          {
            name: "Live Classes",
            href: `${basePath}/live-classes`,
            icon: "🎥",
          },
          { name: "Payments", href: `${basePath}/payments`, icon: "💰" },
          { name: "Reports", href: `${basePath}/reports`, icon: "📊" },
          { name: "Settings", href: `${basePath}/settings`, icon: "⚙️" },
        ];
      case "teacher":
        return [
          ...commonItems,
          { name: "My Courses", href: `${basePath}/courses`, icon: "📚" },
          {
            name: "Live Classes",
            href: `${basePath}/live-classes`,
            icon: "🎥",
          },
          { name: "Students", href: `${basePath}/students`, icon: "🎓" },
          { name: "Analytics", href: `${basePath}/analytics`, icon: "📊" },
          { name: "Earnings", href: `${basePath}/earnings`, icon: "💰" },
          { name: "Messages", href: `${basePath}/messages`, icon: "💬" },
        ];
      case "student":
        return [
          ...commonItems,
          { name: "My Courses", href: `${basePath}/courses`, icon: "📚" },
          { name: "Profile", href: `${basePath}/profile`, icon: "📝" },
          {
            name: "Certificates",
            href: `${basePath}/certificates`,
            icon: "🏆",
          },
        ];
      default:
        return commonItems;
    }
  }, [user]);

  const activeTitle = useMemo(() => {
    return (
      navigationItems.find(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      )?.name || "Dashboard"
    );
  }, [pathname, navigationItems]);

  if (isLoading || (!isAuthenticated && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Shekhabo Logo"
                width={102}
                height={102}
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
              aria-label="Close sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{displayInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Logout button fixed at bottom */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="ml-2 text-lg md:text-xl font-semibold text-gray-900 lg:ml-0 truncate">
              {activeTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLanguageDropdownOpen((v) => !v)}
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-2 md:px-3 py-1.5 rounded-lg transition-colors border border-gray-300"
                aria-haspopup="menu"
                aria-expanded={isLanguageDropdownOpen}
              >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {currentLanguage.code.toUpperCase()}
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
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {(languages || []).map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLanguage(language);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                        currentLanguage.code === language.code
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setIsUserDropdownOpen((v) => !v)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                aria-haspopup="menu"
                aria-expanded={isUserDropdownOpen}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {displayInitial}
                  </span>
                </div>
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
                <div className="absolute right-0 mt-2 min-w-[14rem] bg-white rounded-xl shadow-2xl ring-1 ring-black/5 border border-gray-200 py-1 z-[60] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    Back to Website
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto min-w-0">
          <div className="w-full max-w-full overflow-hidden">{children}</div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
