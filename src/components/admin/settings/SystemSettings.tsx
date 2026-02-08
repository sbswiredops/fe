"use client";

import React from "react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Settings } from "lucide-react";

export default function SystemSettings() {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("systemSettings.title")}
        </h3>
        <p className="text-gray-600">{t("systemSettings.comingSoon")}</p>
      </div>
    </div>
  );
}
