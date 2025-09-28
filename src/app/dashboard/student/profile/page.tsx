/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuth } from "@/components/contexts/AuthContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import React from "react";

export default function StudentProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();

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
    return primary || secondary || roleStr || "User";
  })();

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-8">
          <img
            src={user?.profileImage || "/placeholder-avatar.jpg"}
            alt={displayName || "User"}
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {displayName}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {t("dashboard.student.title")}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
