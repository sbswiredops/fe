"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const exploreLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.courses"), href: "/courses" },
    { name: t("nav.liveClasses"), href: "/live-classes" },
    { name: t("nav.about"), href: "/about" },
    { name: "API Documentation", href: "/api-docs" },
  ];

  const learnLinks = [
    { name: t("footer.support"), href: "/support" },
    { name: t("footer.contactUs"), href: "/contact" },
    { name: t("footer.privacyPolicy"), href: "/privacy" },
    { name: t("footer.termsOfService"), href: "/terms" },
  ];

  const moreLinks = [
    { name: t("nav.dashboard"), href: "/dashboard" },
    { name: "Student Profile", href: "/dashboard/student/profile" },
    { name: "Teacher", href: "/dashboard/teacher" },
    { name: "About Shekhabo", href: "/about" },
  ];

  const socialLinks = [
    { name: "Pinterest", href: "#", icon: "p" },
    { name: "Facebook", href: "#", icon: "f" },
    { name: "Twitter", href: "#", icon: "t" },
    { name: "Instagram", href: "#", icon: "i" },
  ];

  return (
    <footer
      className="relative text-gray-800"
      style={{ backgroundColor: "#8e67b6" }}
    >
      {/* Decorative wave top */}
      <div
        className="absolute inset-x-0 -top-10 pointer-events-none select-none"
        aria-hidden
      >
        <svg
          className="w-full h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C120,60 360,80 540,56 C720,32 900,-8 1080,6 C1260,20 1380,52 1440,64 L1440,80 L0,80 Z"
            fill="#8e67b6"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-14 sm:px-6 lg:px-70 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Column: Social */}
          <div className="lg:pl-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              {t("footer.followUs")}
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <span className="font-semibold uppercase text-sm">
                    {s.icon}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          {/* Column: Explore */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-800 hover:text-[#ebebeb] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Learn */}
          <div>
            <h3 className="mb-4 text-lg font-semibold  text-white">Learn</h3>
            <ul className="space-y-2">
              {learnLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-800 hover:text-[#ebebeb] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: More from Shekhabo */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              More from Shekhabo
            </h3>
            <ul className="space-y-2">
              {moreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-zinc-800 hover:text-[#ebebeb] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-green-200 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-zinc-800 hover:text-[#ebebeb]">
            © {new Date().getFullYear()} shekhabo.com
          </p>
        </div>
      </div>
    </footer>
  );
}
