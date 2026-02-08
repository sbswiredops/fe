"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CourseCard from "@/components/ui/CourseCard";
import { useLanguage } from "../contexts/LanguageContext";
import { courseService } from "@/services/courseService";
import { Course } from "@/components/types";

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
        // Try a few type casings because backend expects lowercase 'recorded'
        const typeCandidates = ["recorded", "Recorded", "RECORDED"];
        let res: any = null;
        for (const t of typeCandidates) {
          res = await courseService.getCoursesByType(t, {
            page: 1,
            limit: 8,
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

  // Only show the latest 4 recorded courses
  const displayedCourses = useMemo(() => courses.slice(0, 4), [courses]);

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-50">
        {/* Header with responsive spacing and font sizes */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {t("recordedCourses.title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            {t("recordedCourses.subtitle")}
          </p>
        </div>

        {/* Courses grid */}
        {loading ? (
          <div className="text-center py-8 md:py-12 text-base md:text-lg text-gray-500">
            {t("recordedCourses.loading")}
          </div>
        ) : error ? (
          <div className="text-center py-8 md:py-12 text-base md:text-lg text-gray-500">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-base md:text-lg text-gray-500">
            {t("recordedCourses.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* View All Courses button with responsive design */}
        <div className="text-center mt-8 md:mt-12">
          <Link href={{ pathname: "/courses", query: { type: "recorded" } }}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto btn-hover px-6 py-3 text-sm md:text-base"
              style={{
                borderColor: "var(--color-text-primary)",
                color: "var(--color-text-primary)",
                backgroundColor: "rgba(80, 53, 110, 0.05)",
                transition: "all 0.2s ease-in-out",
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
              <span className="flex items-center justify-center">
                {t("recordedCourses.viewAll")}
                <svg
                  className="ml-2 w-4 h-4 md:w-5 md:h-5"
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
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
