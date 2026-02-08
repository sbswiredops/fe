"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  Shield,
  Key,
  Settings as SettingsIcon,
  Database,
  Mail,
  Bell,
  Lock,
  Globe,
} from "lucide-react";
import PermissionsManagement from "@/components/admin/settings/PermissionsManagement";
import RolesManagement from "@/components/admin/settings/RolesManagement";
import SystemSettings from "@/components/admin/settings/SystemSettings";

// Tab components (will be created separately)

type TabType =
  | "roles"
  | "permissions"
  | "system"
  | "email"
  | "notifications"
  | "security"
  | "localization";

interface Tab {
  id: TabType;
  label: string;
  labelBn: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: "roles",
    label: "Roles Management",
    labelBn: "রোল ম্যানেজমেন্ট",
    icon: <Shield className="w-5 h-5" />,
    component: RolesManagement,
  },
  {
    id: "permissions",
    label: "Permissions",
    labelBn: "অনুমতি",
    icon: <Key className="w-5 h-5" />,
    component: PermissionsManagement,
  },
  {
    id: "system",
    label: "System Settings",
    labelBn: "সিস্টেম সেটিংস",
    icon: <SettingsIcon className="w-5 h-5" />,
    component: SystemSettings,
  },
];

function AdminSettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("roles");

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || RolesManagement;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {t("adminSettings.title")}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t("adminSettings.subtitle")}
              </p>
            </div>

            {/* Tab Bar */}
            <div className="px-6">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap
                      ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600 font-semibold"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{t(`adminSettings.tabs.${tab.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default AdminSettingsPage;
