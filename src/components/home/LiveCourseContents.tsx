"use client";

import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Zap,
  Users,
  FileText,
  Clock,
  Briefcase,
  BarChart3,
  BookOpen,
  Users as UsersIcon,
  CheckCircle2,
  PlaySquare,
  Check,
} from "lucide-react";

interface LiveCourseFeature {
  id: string;
  key: string;
  icon: React.ReactElement<any, any>;
  color: string;
  bgGradient: string;
  textColor?: string; // added
}

interface LiveCourseStats {
  id: string;
  key: string;
  value: string;
  color: string;
  icon: React.ReactElement<any, any>;
  textColor?: string; // added
}

const features: LiveCourseFeature[] = [
  {
    id: "1",
    key: "dedicatedJobPlacementTeam",
    icon: <Users />, // removed inline color class
    color: "",
    bgGradient: "from-blue-50 to-cyan-50",
    textColor: "text-blue-600",
  },
  {
    id: "2",
    key: "expertCvReview",
    icon: <FileText />,
    color: "",
    bgGradient: "from-green-50 to-emerald-50",
    textColor: "text-green-600",
  },
  {
    id: "3",
    key: "liveSupport18Hours",
    icon: <Clock />,
    color: "",
    bgGradient: "from-purple-50 to-pink-50",
    textColor: "text-purple-600",
  },
  {
    id: "4",
    key: "proBatchCvJobSupport",
    icon: <Briefcase />,
    color: "",
    bgGradient: "from-indigo-50 to-blue-50",
    textColor: "text-indigo-600",
  },
  {
    id: "5",
    key: "selfAssessmentTests",
    icon: <BarChart3 />,
    color: "",
    bgGradient: "from-orange-50 to-red-50",
    textColor: "text-orange-600",
  },
  {
    id: "6",
    key: "supportClassesPerDay",
    icon: <BookOpen />,
    color: "",
    bgGradient: "from-pink-50 to-rose-50",
    textColor: "text-pink-600",
  },
];

const stats: LiveCourseStats[] = [
  {
    id: "1",
    key: "jobPlacement",
    value: "150+",
    color: "from-green-500 to-emerald-600",
    icon: <Briefcase />,
    textColor: "text-green-500",
  },
  {
    id: "2",
    key: "learner",
    value: "2996+",
    color: "from-blue-500 to-indigo-600",
    icon: <UsersIcon />,
    textColor: "text-blue-500",
  },
  {
    id: "3",
    key: "courseCompletionRate",
    value: "83%",
    color: "from-orange-500 to-red-600",
    icon: <CheckCircle2 />,
    textColor: "text-orange-500",
  },
  {
    id: "4",
    key: "courses",
    value: "7+",
    color: "from-yellow-500 to-orange-600",
    icon: <PlaySquare />,
    textColor: "text-yellow-500",
  },
];

export default function LiveCourseContents() {
  const { t } = useLanguage();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <section className="relative py-20  mx-auto px-4 sm:px-10 lg:px-50 bg-gray-50  overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            {t("liveCourseContents.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("liveCourseContents.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                {/* Icon (uses card bg gradient on the icon itself; no separate colored tile) */}
                <div className="inline-flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {React.isValidElement(feature.icon)
                    ? React.cloneElement(
                        feature.icon as React.ReactElement<any>,
                        {
                          className: `w-8 h-8 ${
                            feature.textColor || "text-gray-800"
                          }`,
                        } as any
                      )
                    : feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {t(`liveCourseContents.features.${feature.key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {t(`liveCourseContents.features.${feature.key}.description`)}
                </p>
              </div>

              {/* Hover Effect Border */}
              <div
                className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}
              ></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        {/*
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 w-full"
              style={{
                animationDelay: `${(index + 6) * 0.1}s`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 text-white group-hover:scale-110 transition-transform duration-300 bg-transparent">
                {React.isValidElement(stat.icon)
                  ? React.cloneElement(
                      stat.icon as React.ReactElement<any>,
                      {
                        className: `w-6 h-6 ${
                          stat.textColor || "text-gray-800"
                        }`,
                      } as any
                    )
                  : stat.icon}
              </div>

              <div
                className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
              >
                {stat.value}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t(`liveCourseContents.stats.${stat.key}.label`)}
              </h3>

              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              ></div>
            </div>
          ))}
        </div>
        */}

        {/* CTA Section */}
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                {t("liveCourseContents.cta.title")}
              </h3>
              <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
                {t("liveCourseContents.cta.description")}
              </p>

              {/* Features List */}
              <div className="flex flex-wrap justify-center gap-6 text-white/90">
                {[
                  "industryExperts",
                  "cvReviews",
                  "jobSupport",
                  "support247",
                ].map((itemKey, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
                  >
                    <Check className="w-5 h-5 text-green-300 mr-3" />
                    <span className="font-medium">
                      {t(`liveCourseContents.cta.highlights.${itemKey}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
