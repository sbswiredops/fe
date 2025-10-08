/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Image from "next/image";
import {
  Home,
  Users,
  Briefcase,
  BookOpen,
  Video,
  CreditCard,
  BarChart3,
  Settings,
  GraduationCap,
  PieChart,
  DollarSign,
  MessageSquare,
  FileText,
  Trophy,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const authFromStorage =
    typeof window !== "undefined"
      ? !!localStorage.getItem("access_token")
      : false;
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] =
    useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isLoading && !isAuthenticated && !authFromStorage) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, authFromStorage, router]);

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

    const commonItems = [{ name: "Dashboard", href: basePath, icon: Home }];

    switch (roleGroup) {
      case "admin":
        return [
          ...commonItems,
          { name: "Users", href: `${basePath}/users`, icon: Users },
          { name: "Employees", href: `${basePath}/employees`, icon: Briefcase },
          { name: "Courses", href: `${basePath}/courses`, icon: BookOpen },
          {
            name: "Live Classes",
            href: `${basePath}/live-classes`,
            icon: Video,
          },
          { name: "Payments", href: `${basePath}/payments`, icon: CreditCard },
          { name: "Reports", href: `${basePath}/reports`, icon: BarChart3 },
          { name: "Settings", href: `${basePath}/settings`, icon: Settings },
        ];
      case "teacher":
        return [
          ...commonItems,
          { name: "My Courses", href: `${basePath}/courses`, icon: BookOpen },
          {
            name: "Analytics",
            href: `${basePath}/analytics`,
            icon: PieChart,
          },
          { name: "Revenue", href: `${basePath}/revenues`, icon: DollarSign },
        ];
      case "student":
        return [
          ...commonItems,
          { name: "My Courses", href: `${basePath}/courses`, icon: BookOpen },
          { name: "Profile Settings", href: `/profile`, icon: User },
          {
            name: "Certificates",
            href: `${basePath}/certificates`,
            icon: Trophy,
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

  const effectiveAuth = isAuthenticated || authFromStorage;
  if (!effectiveAuth && typeof window !== "undefined") {
    return null;
  }

  const showSidebarDetails = isSidebarOpen || isDesktopSidebarExpanded;
  const desktopSidebarWidthClass = isDesktopSidebarExpanded
    ? "lg:w-72"
    : "lg:w-24";
  const headerPaddingClass = showSidebarDetails ? "px-4" : "px-3";
  const headerJustifyClass = showSidebarDetails
    ? "justify-between"
    : "justify-center lg:justify-between";
  const profilePaddingClass = showSidebarDetails
    ? "p-4"
    : "p-3 lg:px-3 lg:py-4";
  const navigationPaddingClass = showSidebarDetails
    ? "px-4 space-y-1"
    : "px-2 space-y-2";
  const footerPaddingClass = showSidebarDetails ? "p-4" : "p-3 lg:px-3 lg:py-4";
  const ToggleIcon = isDesktopSidebarExpanded ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg flex flex-col
    ${desktopSidebarWidthClass}
    transition-all duration-300 ease-in-out
    ${isDesktopSidebarExpanded ? "lg:w-72" : "lg:w-24"}
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static lg:inset-0
  `}
      >
        <div className="flex-1 flex flex-col bg">
          <div
            className={`flex items-center ${headerPaddingClass} ${headerJustifyClass} h-16 border-b border-gray-200 relative`}
          >
            <Link href="/" className="flex items-center justify-center">
              <Image
                src={showSidebarDetails ? "/logo.png" : "/icone5.png"}
                alt="Shekhabo Logo"
                width={showSidebarDetails ? 102 : 45} // Reduce width when collapsed
                height={showSidebarDetails ? 102 : 45} // Reduce height when collapsed
                style={showSidebarDetails ? {} : { objectFit: "contain" }} // Optional: prevent overflow
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsDesktopSidebarExpanded((prev) => !prev)}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-full border border-gray-200 text-gray-100 hover:text-[#51356e] hover:border-[#51356e] transition-colors absolute"
              style={{
                top: "50%",
                right: "-18px",
                transform: "translateY(-50%)",
                background: "#51356e",
                boxShadow: "0 0 6px rgba(0,0,0,0.07)",
                zIndex: 10,
              }}
              aria-label={
                isDesktopSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
              }
            >
              <ToggleIcon className="w-5 h-5 text-gray-100" />
            </button>
          </div>

          <div className={`${profilePaddingClass} border-b border-gray-200`}>
            <div
              className={`flex items-center ${
                showSidebarDetails ? "space-x-3" : "justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{displayInitial}</span>
              </div>
              {showSidebarDetails && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
                </div>
              )}
            </div>
          </div>

          <nav
            className={`flex-1 py-4 overflow-y-auto ${navigationPaddingClass}`}
          >
            <div className="flex flex-col gap-4 px-4 py-3">
              {navigationItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const IconComponent = item.icon;
                const baseStyles = active
                  ? "bg-[#e1d3ea] text-[color:var(--color-text-primary)]" // changed background to #e1d3ea
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
                const alignmentClass = showSidebarDetails
                  ? "justify-start"
                  : "justify-center";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={showSidebarDetails ? undefined : item.name}
                    className={`flex items-center ${alignmentClass} py-2 px-3 text-sm font-medium rounded-lg transition-colors ${baseStyles}`}
                  >
                    <IconComponent
                      className={`${showSidebarDetails ? "mr-3" : ""} h-10 w-7`}
                    />
                    {showSidebarDetails && item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:ml-0 min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
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
                <ChevronDown
                  className={`w-3 h-3 transition-transform text-gray-500 ${
                    isLanguageDropdownOpen ? "rotate-180" : ""
                  }`}
                />
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
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                />
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

        <main className="flex-1 overflow-auto min-w-0">
          <div className="w-full max-w-full overflow-hidden">{children}</div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
