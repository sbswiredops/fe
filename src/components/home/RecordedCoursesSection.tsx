"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CourseCard from "@/components/ui/CourseCard";
import CardSlider from "@/components/ui/CardSlider";
import { useLanguage } from "../contexts/LanguageContext";
import courseService from "@/services/courseService";

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

// ...existing code...
export default function RecordedCoursesSection() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<RecordedCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const type = "Recorded";
      const res = await courseService.getCoursesByType(type, {
        page: 1,
        limit: 8,
        sortBy: "createdAt",
        sortOrder: "DESC",
      });
      if (res.success && res.data) {
        setCourses(
          res.data.courses.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor?.name || course.instructorId || "",
            instructorId: course.instructorId,
            duration: course.duration,
            price: Number(course.price),
            rating: Number(course.rating),
            enrolledStudents: course.enrollmentCount,
            thumbnail: course.thumbnail,
            type: "Recorded",
            isRecorded: true,
            category: course.category?.name || course.category || "General",
            createdAt: course.createdAt || "",
          }))
        );
      } else {
        setCourses([]);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // Removed StarRating, using CourseCard instead

  // Only show the latest 5 recorded courses
  const displayedCourses = courses.slice(0, 5);

  return (
    <section className="pt-16 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-50">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Recorded Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access premium recorded courses and sessions
          </p>
        </div>

        {/* Courses Slider */}
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">
            Loading...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-lg text-gray-500">
            No courses found.
          </div>
        ) : (
          <CardSlider
            items={courses.map((course) => ({
              ...course,
              duration:
                typeof course.duration === "string"
                  ? course.duration
                  : String(course.duration),
              thumbnail: course.thumbnail ?? "",
              rating:
                typeof course.rating === "number"
                  ? course.rating
                  : Number(course.rating),
              createdAt:
                typeof course.createdAt === "string"
                  ? new Date(course.createdAt)
                  : course.createdAt,
            }))}
            title={t("Recorded Courses") || "Recorded Courses"}
            categories={[
              ...new Set(courses.map((c) => c.category || "General")),
            ]}
            className="mb-8"
            renderItem={(course) => <CourseCard course={course} />}
          />
        )}

        {/* View All Courses */}
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
              View All Recorded Courses
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
// ...existing code...
