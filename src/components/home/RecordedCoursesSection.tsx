/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { StarRating } from "@/components/ui/CourseCard";
import { useLanguage } from "../contexts/LanguageContext";
import { courseService } from "@/services/courseService";
import { Course } from "@/components/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ExtendedCourse = Course & { enrolledStudents: number; sku?: string };

enum CourseType {
  RECORDED = "Recorded",
  FREE_LIVE = "Free Live",
  UPCOMING_LIVE = "Upcoming Live",
}

export default function RecordedCoursesSection() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    const mapApiCourseToUi = (c: any): ExtendedCourse => {
      const instructorObj =
        c?.instructor && typeof c.instructor === "object"
          ? c.instructor
          : {
              id: c?.instructorId || "",
              name:
                c?.instructor?.name ||
                [c?.instructor?.firstName, c?.instructor?.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                c?.instructorId ||
                "Instructor",
            };
      const categoryName = c?.category?.name || c?.category || "General";
      const created = c?.createdAt ? new Date(c.createdAt) : new Date();
      const durationStr =
        typeof c?.totalDuration === "string" && c?.totalDuration
          ? c.totalDuration
          : typeof c?.duration === "number"
            ? `${c.duration} min`
            : String(c?.duration || "");
      const courseTypeRaw = (c?.courseType || "").toString().toLowerCase();
      let type: CourseType = CourseType.RECORDED;
      if (courseTypeRaw.includes("free")) type = CourseType.FREE_LIVE;
      else if (courseTypeRaw.includes("upcoming"))
        type = CourseType.UPCOMING_LIVE;
      else if (courseTypeRaw.includes("live")) type = CourseType.UPCOMING_LIVE;

      return {
        id: c.id,
        sku: c.sku ?? c.id,
        title: c.title,
        description: c.description,
        instructor: instructorObj,
        instructorId: c.instructorId || (c?.instructor?.id ?? ""),
        price: Number(c.price ?? 0),
        duration: durationStr || "",
        thumbnail: c.thumbnail || "/placeholder-course.jpg",
        category: categoryName,
        enrolledStudents: Number(c.enrollmentCount ?? 0),
        rating: Number(c.rating ?? 0),
        createdAt: created,
        sections: c.sections ?? [],
        courseIntroVideo: c.courseIntroVideo ?? "",
        enrollmentCount: c.enrollmentCount ?? 0,
        type,
      } as ExtendedCourse;
    };

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const typeCandidates = ["recorded", "Recorded", "RECORDED"];
        let res: any = null;
        for (const t of typeCandidates) {
          res = await courseService.getCoursesByType(t, {
            page: 1,
            limit: 12,
            sortBy: "createdAt",
            sortOrder: "DESC",
          });
          if (
            res &&
            res.success &&
            ((Array.isArray(res.data) && res.data.length > 0) ||
              (res.data &&
                Array.isArray(res.data.courses) &&
                res.data.courses.length > 0))
          ) {
            break;
          }
        }

        if (!ignore && res && res.success) {
          const rawCourses = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.courses)
              ? res.data.courses
              : [];
          if (Array.isArray(rawCourses) && rawCourses.length > 0) {
            setCourses(rawCourses.map(mapApiCourseToUi));
          } else {
            setCourses([]);
          }
        } else if (!ignore) {
          setCourses([]);
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e?.message || "Failed to load courses");
          setCourses([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchCourses();
    return () => {
      ignore = true;
    };
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (isAutoPlaying && courses.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.ceil(courses.length / 4));
      }, 4000); // Change every 4 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, courses.length]);

  const displayedCourses = useMemo(() => courses, [courses]);

  // Calculate visible courses for current slide
  const visibleCourses = displayedCourses.slice(
    currentIndex * 4,
    currentIndex * 4 + 4,
  );

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= Math.ceil(courses.length / 4) - 1 ? 0 : prev + 1,
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.ceil(courses.length / 4) - 1 : prev - 1,
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className="pt-16 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("recordedCourses.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("recordedCourses.subtitle")}
          </p>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600 py-8">{error}</div>
        )}

        {!loading && !error && displayedCourses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No recorded courses available.
          </div>
        )}

        {!loading && !error && displayedCourses.length > 0 && (
          <div className="relative">
            {/* Desktop Navigation Buttons */}
            <div className="hidden md:block">
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Courses Grid */}
            <div
              ref={containerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-in-out"
            >
              {visibleCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.sku ?? course.id}`}
                  className="block group focus:outline-none"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <div className="mx-auto w-72 max-w-[280px] bg-white rounded-xl border border-[#e6dcf4] transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer overflow-hidden">
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      {course.thumbnail ? (
                        <img
                          className="w-full h-full object-contain object-top bg-white"
                          src={course.thumbnail}
                          alt={course.title || "Course thumbnail"}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}

                      <div
                        className={`w-full h-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 ${
                          course.thumbnail ? "hidden" : "flex"
                        }`}
                      >
                        <svg
                          className="w-16 h-16 text-blue-500 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col justify-between h-[280px]">
                      <div>
                        <div className="mb-2">
                          <span className="inline-block px-3 py-1 bg-[#efe6fb] text-[#51356e] text-xs rounded font-semibold shadow-sm">
                            {typeof course.category === "string"
                              ? course.category
                              : (course.category as any)?.name || "General"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#51356e]">
                          {course.title}
                        </h3>

                        {(() => {
                          const instructor = course.instructor as any;
                          const avatarUrl = instructor?.avatar || null;
                          const initials = instructor?.name
                            ? instructor.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "IN";

                          return (
                            <div className="flex items-center mb-3">
                              {avatarUrl ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-200">
                                  <img
                                    src={avatarUrl}
                                    alt={instructor?.name || "Instructor"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 mr-3 rounded-full bg-[#51356e] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                  {initials}
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {instructor?.name || "Instructor"}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex items-center justify-between mb-3">
                          <StarRating rating={Number(course.rating) || 0} />
                        </div>
                      </div>

                      <hr className="my-1 border-gray-200" />

                      <div className="flex items-center justify-between">
                        {(() => {
                          const discountPrice = (course as any).discountPrice;
                          const price = course.price;
                          const hasDiscount =
                            discountPrice != null &&
                            price != null &&
                            Number(discountPrice) > 0 &&
                            Number(discountPrice) < Number(price);

                          return (
                            <div className="flex items-baseline gap-2">
                              <div className="text-2xl font-bold text-[#51356e]">
                                ৳
                                {hasDiscount
                                  ? Number(discountPrice).toFixed(0)
                                  : Number(price).toFixed(0)}
                              </div>
                              {hasDiscount && (
                                <div className="text-sm line-through text-gray-400">
                                  ৳{Number(price).toFixed(0)}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Dots Indicator */}
            {courses.length > 4 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {Array.from({
                  length: Math.ceil(courses.length / 4),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Mobile Auto-slide Indicator */}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href={{ pathname: "/courses", query: { type: "recorded" } }}>
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
