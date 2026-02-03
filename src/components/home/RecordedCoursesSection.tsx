"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CourseCard from "@/components/ui/CourseCard";
import CardSlider from "@/components/ui/CardSlider";
import { useLanguage } from "../contexts/LanguageContext";
import { CourseService } from "@/services/courseService"; // changed

interface RecordedCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  duration: string | number;
  price: number;
  rating: number | string;
  enrolledStudents: number;
  thumbnail: string | null;
  type: string;
  isRecorded?: boolean;
  category: string;
  createdAt: string; // or Date, depending on your model
}

export default function RecordedCoursesSection() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<RecordedCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      // Try a few type casings because backend expects lowercase 'recorded'
      const typeCandidates = ["recorded", "Recorded", "RECORDED"];
      const svc = new CourseService(); // use class instance
      let res: any = null;
      for (const t of typeCandidates) {
        // request with pagination/sort
        res = await svc.getCoursesByType(t, {
          page: 1,
          limit: 8,
          sortBy: "createdAt",
          sortOrder: "DESC",
        });
        // accept either array responses or { courses: [] } shapes
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

      if (res && res.success) {
        const rawCourses = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.courses)
            ? res.data.courses
            : [];
        if (Array.isArray(rawCourses) && rawCourses.length > 0) {
          setCourses(
            rawCourses.map((course: any) => ({
              id: course.id ?? course._id ?? "",
              sku: course.sku ?? course.id ?? course._id ?? "",
              title: course.title,
              description: course.description,
              instructor: course.instructor?.name || course.instructorId || "",
              instructorId: course.instructorId,
              duration: course.duration,
              price: Number(course.price),
              rating: Number(course.rating),
              enrolledStudents: course.enrollmentCount ?? 0,
              thumbnail: course.thumbnail ?? null,
              type: "Recorded",
              isRecorded: true,
              category: course.category?.name || course.category || "General",
              createdAt: course.createdAt || "",
            })),
          );
        } else {
          setCourses([]);
        }
      } else {
        setCourses([]);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // Removed StarRating, using CourseCard instead

  // Only show the latest 4 recorded courses in the slider
  const displayedCourses = courses.slice(0, 4);

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

        {/* Courses Slider with responsive handling */}
        {loading ? (
          <div className="text-center py-8 md:py-12 text-base md:text-lg text-gray-500">
            {t("recordedCourses.loading")}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-base md:text-lg text-gray-500">
            {t("recordedCourses.empty")}
          </div>
        ) : (
          <div className="relative">
            <CardSlider
              items={displayedCourses.map((course) => ({
                ...course,
                // ensure duration is a string for the slider/card
                duration:
                  typeof course.duration === "string"
                    ? course.duration
                    : String(course.duration),
                // thumbnail must be a string
                thumbnail: course.thumbnail ?? "",
                // rating must be a number
                rating:
                  typeof course.rating === "number"
                    ? course.rating
                    : Number(course.rating),
                // CardSlider / Course expects createdAt as a Date in many components
                createdAt:
                  typeof course.createdAt === "string"
                    ? new Date(course.createdAt)
                    : course.createdAt,
                // add missing Course properties with safe defaults so the mapped object matches the Course type
                sections: (course as any).sections ?? [],
                courseIntroVideo: (course as any).courseIntroVideo ?? null,
                enrollmentCount:
                  (course as any).enrollmentCount ??
                  (course as any).enrolledStudents ??
                  0,
                // Fix: instructor should be an object, not a string
                instructor:
                  typeof course.instructor === "object" &&
                  course.instructor !== null
                    ? {
                        id:
                          (course.instructor as any).id ??
                          course.instructorId ??
                          "",
                        name: (course.instructor as any)?.name ?? "",
                        firstName: (course.instructor as any)?.firstName,
                        lastName: (course.instructor as any)?.lastName,
                        avatar: (course.instructor as any)?.avatar,
                        bio: (course.instructor as any)?.bio,
                      }
                    : {
                        id: course.instructorId ?? "",
                        name:
                          typeof course.instructor === "string"
                            ? course.instructor
                            : "",
                      },
              }))}
              title={t("recordedCourses.title")}
              categories={courses
                .map((c) => {
                  if (typeof c.category === "object" && c.category !== null) {
                    // Ensure the object has an id and name
                    return {
                      id:
                        (c.category as any).id ??
                        (typeof c.category === "object" &&
                        (c.category as any).name
                          ? (c.category as any).name
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                          : "general"),
                      name: (c.category as any).name ?? String(c.category),
                      description: (c.category as any).description ?? "",
                      categories_avatar:
                        (c.category as any).categories_avatar ?? null,
                      icon: (c.category as any).icon ?? undefined,
                      isActive: (c.category as any).isActive ?? undefined,
                      createdAt: (c.category as any).createdAt ?? undefined,
                      updatedAt: (c.category as any).updatedAt ?? undefined,
                    };
                  } else {
                    // Fallback for string category
                    const name = c.category || "General";
                    return {
                      id: name.toLowerCase().replace(/\s+/g, "-"),
                      name,
                      description: "",
                      categories_avatar: null,
                    };
                  }
                })
                .filter(
                  (cat, idx, arr) =>
                    cat && arr.findIndex((c) => c.id === cat.id) === idx,
                )}
              className="mb-4 md:mb-8"
              renderItem={(course) => (
                <div className="px-2 md:px-3 w-full">
                  <CourseCard course={course} />
                </div>
              )}
            />
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
