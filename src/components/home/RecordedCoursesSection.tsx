"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLanguage } from "../contexts/LanguageContext";
import courseService from "@/services/courseService";

interface RecordedCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  duration: string | number;
  price: number | string;
  rating: number | string;
  enrolledStudents: number;
  thumbnail: string | null;
  type: string;
  isRecorded?: boolean;
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
            price: course.price,
            rating: Number(course.rating),
            enrolledStudents: course.enrollmentCount,
            thumbnail: course.thumbnail,
            type: "Recorded",
            isRecorded: true,
          }))
        );
      } else {
        setCourses([]);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}</span>
    </div>
  );

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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-12 text-lg text-gray-500">
              Loading...
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="col-span-4 text-center py-12 text-lg text-gray-500">
              No courses found.
            </div>
          ) : (
            displayedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden card-shadow-hover"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100">
                  <div className="absolute inset-0 flex items-center justify-center">
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
                  {course.isRecorded && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        RECORDED
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-4 flex flex-col justify-between h-[300px]">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center mb-3 mt-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof (course as any)?.instructor === "string"
                            ? (course as any).instructor
                            : (course as any)?.instructor?.name ||
                              (course as any)?.instructorId ||
                              "Instructor"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <StarRating rating={Number(course.rating)} />
                      <span className="text-sm text-gray-500">
                        {course.enrolledStudents?.toLocaleString()} students
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="w-full">
                      <Link href={`/recorded/${course.id}`}>
                        <Button
                          size="sm"
                          className="w-full min-h-[40px] btn-hover justify-center btn-animate border-[2px] rounded-lg flex items-center text-base"
                          style={{
                            borderColor: "var(--color-text-primary)",
                            color: "var(--color-text-primary)",
                            backgroundColor: "rgba(80, 53, 110, 0.05)",
                            minWidth: "0",
                            maxWidth: "100%",
                            transition: "background 0.2s, color 0.2s",
                            height: "40px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--color-text-primary)";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(80, 53, 110, 0.05)";
                            e.currentTarget.style.color =
                              "var(--color-text-primary)";
                          }}
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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
