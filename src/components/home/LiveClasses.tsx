"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { LiveClass } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import courseService from "@/services/courseService";

export default function LiveClasses() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<LiveClass[]>([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await courseService.getCoursesByType("Upcoming Live", {
          limit: 9,
          sortBy: "createdAt",
          sortOrder: "DESC",
        });
        const list = (res?.data as any)?.courses || [];
        if (!ignore && res?.success && Array.isArray(list)) {
          const mapped: LiveClass[] = list.map((c: any) => {
            const instructorName =
              c?.instructor?.name ||
              [c?.instructor?.firstName, c?.instructor?.lastName]
                .filter(Boolean)
                .join(" ") ||
              c?.instructorId ||
              "Instructor";
            const created = c?.createdAt ? new Date(c.createdAt) : new Date();
            let durationMin: number = 0;
            if (typeof c?.duration === "number") durationMin = c.duration;
            else if (typeof c?.totalDuration === "string") {
              const m = c.totalDuration.match(/(\d+)/g);
              const n = m ? Number(m[m.length - 1]) : 0;
              durationMin = Number.isFinite(n) ? n : 0;
            }
            return {
              id: String(c.id),
              title: String(c.title || ""),
              description: String(c.description || ""),
              instructor: String(instructorName),
              instructorId: String(c.instructorId || c?.instructor?.id || ""),
              scheduledAt: created,
              duration: durationMin,
              meetingLink: "",
              maxParticipants: Number(c?.maxParticipants ?? 0) || 0,
              currentParticipants: Number(c?.enrollmentCount ?? 0),
              isActive: String(c?.status || "").toLowerCase() === "published",
            } as LiveClass;
          });
          setClasses(mapped);
        }
      } catch {
        if (!ignore) setClasses([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-50">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("liveClasses.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("liveClasses.subtitle")}
          </p>
        </div>

        {/* Live Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {classes.length === 0 && (
            <div className="col-span-1 lg:col-span-2 xl:col-span-3 text-center text-gray-500 py-8">
              No live classes available.
            </div>
          )}
          {classes.map((liveClass) => (
            <div
              key={liveClass.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden card-shadow-hover"
            >
              {/* Class Header */}
              <div className="relative  p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="bg-white bg-opacity-20 text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ color: "#7123bbff" }}
                  >
                    🔴 LIVE
                  </span>
                  <span className="text-sm opacity-90">
                    {formatDuration(liveClass.duration)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {liveClass.title}
                </h3>
                <p className="text-sm opacity-90 line-clamp-2">
                  {liveClass.description}
                </p>
              </div>

              {/* Class Content */}
              <div className="p-6">
                {/* Instructor */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {liveClass.instructor}
                    </p>
                    <p className="text-xs text-gray-500">Instructor</p>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {t("liveClasses.scheduled")}:{" "}
                      {formatDate(liveClass.scheduledAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>
                      {liveClass.currentParticipants}/
                      {liveClass.maxParticipants}{" "}
                      {t("liveClasses.participants")}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Seats Filled</span>
                    <span>
                      {Math.round(
                        (liveClass.currentParticipants /
                          liveClass.maxParticipants) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (liveClass.currentParticipants /
                            liveClass.maxParticipants) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Join Button */}
                <Link href={`/live-classes/${liveClass.id}`}>
                  <Button
                    className="w-full btn-hover"
                    disabled={
                      liveClass.currentParticipants >= liveClass.maxParticipants
                    }
                  >
                    {liveClass.currentParticipants >= liveClass.maxParticipants
                      ? "Class Full"
                      : t("liveClasses.joinClass")}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Classes */}
        <div className="text-center mt-12">
          <Link href={{ pathname: "/courses", query: { type: "live" } }}>
            <Button
              variant="outline"
              size="lg"
              className="btn-hover"
              style={{
                borderColor: "var(--color-text-primary)",
                color: "var(--color-text-primary)",
                backgroundColor: "rgba(80, 53, 110, 0.05)",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-text-primary)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(80, 53, 110, 0.05)";
                e.currentTarget.style.color = "var(--color-text-primary)";
              }}
            >
              View All Live Classes
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
