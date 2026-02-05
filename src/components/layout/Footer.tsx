"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  const exploreLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.courses"), href: "/courses" },
    // { name: t("nav.liveClasses"), href: "/live-classes" },
    { name: t("nav.about"), href: "/about" },
    // { name: "API Documentation", href: "/api-docs" },
  ];

  const learnLinks = [
    { name: t("footer.contactUs"), href: "/contact" },
    { name: t("footer.support"), href: "/support" },
    { name: t("footer.privacyPolicy"), href: "/privacy" },
    { name: t("footer.termsOfService"), href: "/terms" },
    { name: t("footer.refundPolicy"), href: "/refund" },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/shekhabo-limited",
      icon: Linkedin,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/shekhabo.insta?",
      icon: Instagram,
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@Shekhabo",
      icon: Youtube,
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/Shekhaboltd/",
      icon: Facebook,
    },
  ];

  return (
    <footer
      className="relative"
      style={{ backgroundColor: "#51356e" }} // dark gray background
    >
      {/* Decorative wave top */}
      <div
        className="absolute inset-x-0 -top-10 pointer-events-none select-none"
        aria-hidden
      ></div>

      <div className="max-w-7xl mx-auto px-14 sm:px-6 lg:px-70 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Column: Social */}
          <div className="lg:pl-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">
              {t("footer.followUs")}
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#ffffff17] text-white flex  items-center justify-center hover:bg-[#9aa09e5e] transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
          {/* Column: Explore */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-100">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-[#F8F9FA] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Learn */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-100">{t("footer.learn")}</h3>
            <ul className="space-y-2">
              {learnLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-[#F8F9FA] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Contact (replaces More from Shekhabo) */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-100">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail
                  className="pt-1 text-gray-100"
                  size={18}
                  aria-hidden="true"
                />
                <a
                  href="mailto:teamshekhabo@gmail.com"
                  className="text-gray-200 hover:text-[#F8F9FA] transition-colors"
                >
                  contact@shekhabo.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="pt-1 text-gray-100"
                  size={18}
                  aria-hidden="true"
                />
                <span className="text-gray-200">
                  {t("footer.address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-400 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-gray-200 hover:text-[#F8F9FA]">
            © {new Date().getFullYear()} Shekhabo Ltd.
          </p>
          <p className="text-sm text-gray-200 md:text-right">
            TRAD/DNCC/028948/2025&nbsp;|&nbsp;TIN 158155909036
          </p>
        </div>
      </div>
    </footer>
  );
}
