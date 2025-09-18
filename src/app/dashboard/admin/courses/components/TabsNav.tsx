"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/admin/courses/categories", label: "Categories" },
  { href: "/dashboard/admin/courses", label: "Courses" },
  { href: "/dashboard/admin/courses/sections", label: "Sections" },
  { href: "/dashboard/admin/courses/lessons", label: "Lessons" },
  { href: "/dashboard/admin/courses/quiz", label: "Quiz" },
  { href: "/dashboard/admin/courses/certificate", label: "Certificate" },
];

export default function TabsNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
      <nav className="flex flex-wrap gap-2" aria-label="Course management tabs">
        {tabs.map((t) => {
          const active =
            pathname === t.href ||
            (t.href !== "/dashboard/admin/courses" && pathname?.startsWith(t.href));
          const classes = [
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            active ? "bg-[#51356e] text-white" : "text-gray-700 hover:bg-gray-100",
          ].join(" ");
          return (
            <Link key={t.href} href={t.href} className={classes} prefetch={false}>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
