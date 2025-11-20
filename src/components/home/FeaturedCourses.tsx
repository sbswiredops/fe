"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Course } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import CourseCard from "@/components/ui/CourseCard";
import courseService from "@/services/courseService";

export default function FeaturedCourses() {
  const { t } = useLanguage();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch featured courses and auto-slide
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const tryTypes = ["Featured"];
        let list: any[] | null = null;
        for (const t of tryTypes) {
          const res = await courseService.getCoursesByType(t, {
            limit: 12,
            sortBy: "createdAt",
            sortOrder: "DESC",
          });
          const arr =
            (res?.data as any)?.courses ||
            (Array.isArray(res?.data) ? (res?.data as any) : []);
          if (res?.success && Array.isArray(arr)) {
            list = arr;
            break;
          }
        }
        if (!list) {
          const res2 = await courseService.getFeaturedCourses({ limit: 12 });
          list = Array.isArray(res2?.data) ? (res2.data as any[]) : [];
        }
        if (!ignore && Array.isArray(list)) {
          const mapped: Course[] = list.map((c: any) => {
            const instructorName =
              c?.instructor?.name ||
              [c?.instructor?.firstName, c?.instructor?.lastName]
                .filter(Boolean)
                .join(" ") ||
              c?.instructorId ||
              "Instructor";
            const categoryName = c?.category?.name || c?.category || "General";
            const created = c?.createdAt ? new Date(c.createdAt) : new Date();
            const durationStr =
              typeof c?.totalDuration === "string" && c?.totalDuration
                ? c.totalDuration
                : typeof c?.duration === "number"
                ? `${c.duration} min`
                : String(c?.duration || "");
            return {
              id: String(c.id),
              title: String(c.title || ""),
              description: String(c.description || ""),
              instructor: String(instructorName),
              instructorId: String(c.instructorId || c?.instructor?.id || ""),
              price: Number(c.price ?? 0),
              duration: durationStr,
              thumbnail: c.thumbnail || "/placeholder-course.jpg",
              category: String(categoryName),
              // keep the existing enrolledStudents for consumers that use it
              enrolledStudents: Number(c.enrollmentCount ?? c.enrolledStudents ?? 0),
              // ensure Course type's required enrollmentCount is present
              enrollmentCount: Number(c.enrollmentCount ?? c.enrolledStudents ?? 0),
              rating: Number(c.rating ?? 0),
              // ensure Course type's required courseIntroVideo is present (nullable)
              courseIntroVideo: c.courseIntroVideo ?? c.introVideo ?? null,
              // ensure Course type's required sections is present (empty array default)
              sections: Array.isArray(c.sections) ? c.sections : [],
              createdAt: created,
            };
          });
          setCourses(mapped);
        }
      } catch {
        if (!ignore) setCourses([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = Math.max(0, courses.length - 1);
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered, courses.length]);

  // Removed scroll effect

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Removed nextSlide and prevSlide functions

  return (
    <section className="pt-16 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-50">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("featuredCourses.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("featuredCourses.subtitle")}
          </p>
        </div>

        {/* Slider Container (no arrows, no scroll) */}
        <div className="relative">
          <div className="pl-6 pr-4 sm:pl-8 sm:pr-8 -my-4 py-4">
            <div
              ref={sliderRef}
              className="flex gap-0 sm:gap-6 lg:gap-8 overflow-visible slider-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {courses.map((course, idx) => (
                <div
                  key={course.id}
                  data-card
                  className={`${
                    idx === 0 ? "ml-4 sm:ml-8" : ""
                  } transition-all duration-300`}
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator removed */}
        </div>

        {/* View All Courses */}
        <div className="text-center mt-12">
          <Link href="/courses">
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
              View All Courses
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
