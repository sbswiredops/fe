/* eslint-disable @next/next/no-img-element */
"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { Course } from "@/types/api";

const userService = new UserService();

interface EnrolledCourseData extends Course {
  progress?: {
    completedLessons?: number;
    totalLessons?: number;
    progressPercentage?: number;
  };
  enrolledAt?: string;
}

function CourseCard({ course }: { course: EnrolledCourseData }): JSX.Element {
  const router = useRouter();
  const progressPercentage = course.progress?.progressPercentage || 0;
  const completedLessons = course.progress?.completedLessons || 0;
  const totalLessons = course.progress?.totalLessons || course.totalLessons || 0;

  const handleContinue = () => {
    router.push(`/dashboard/student/learn/${course.id}`);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"
              />
            </svg>
          </div>
        )}
        {progressPercentage === 100 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            ✓ Completed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
            {String(course.title || "Untitled Course")}
          </h3>
          {course.category && (
            <p className="text-xs text-gray-500 mt-1">
              {typeof course.category === "string"
                ? course.category
                : (course.category as any)?.name || "Course"}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs text-gray-600">
              {completedLessons}/{totalLessons} lessons
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercentage >= 75
                  ? "bg-green-500"
                  : progressPercentage >= 50
                  ? "bg-yellow-500"
                  : progressPercentage > 0
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {progressPercentage.toFixed(0)}% complete
          </p>
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-y border-gray-100">
          {course.duration && (
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-gray-900">
                {String(course.duration)} min
              </p>
            </div>
          )}
          {course.rating !== undefined && (
            <div>
              <p className="text-xs text-gray-500">Rating</p>
              <p className="text-sm font-semibold text-gray-900">
                ⭐ {parseFloat(String(course.rating)).toFixed(1)}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-colors mt-auto ${
            progressPercentage === 100
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {progressPercentage === 100 ? "Review Course" : "Continue Learning"}
        </button>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}): JSX.Element {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage(): JSX.Element {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { setCourses } = useEnrolledCourses();
  const userId = user?.id;

  const [courses, setCoursesState] = useState<EnrolledCourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<"all" | "in-progress" | "completed">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authLoading || !userId) {
      return;
    }

    let isMounted = true;

    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await userService.getEnrolledCourses(userId);

        if (isMounted) {
          const coursesList = response?.data?.courses || [];
          setCoursesState(coursesList);
          setCourses(coursesList);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching enrolled courses:", err);
          setError("Failed to load your courses");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEnrolledCourses();

    return () => {
      isMounted = false;
    };
  }, [userId, authLoading, setCourses]);

  // Filter and search courses
  useEffect(() => {
    let filtered = courses;

    // Filter by status
    if (filterBy === "in-progress") {
      filtered = filtered.filter(
        (c) => (c.progress?.progressPercentage || 0) > 0 && (c.progress?.progressPercentage || 0) < 100
      );
    } else if (filterBy === "completed") {
      filtered = filtered.filter((c) => (c.progress?.progressPercentage || 0) === 100);
    }

    // Search by title or category
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          String(c.title || "").toLowerCase().includes(search) ||
          (typeof c.category === "string"
            ? c.category.toLowerCase().includes(search)
            : (c.category as any)?.name?.toLowerCase().includes(search))
      );
    }

    setFilteredCourses(filtered);
  }, [courses, filterBy, searchTerm]);

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(
      (c) => (c.progress?.progressPercentage || 0) === 100
    ).length,
    inProgressCourses: courses.filter(
      (c) => (c.progress?.progressPercentage || 0) > 0 && (c.progress?.progressPercentage || 0) < 100
    ).length,
    totalHours: courses.reduce(
      (sum, c) => sum + (parseInt(String(c.duration || 0)) || 0),
      0
    ),
    averageProgress:
      courses.length > 0
        ? Math.round(
            courses.reduce((sum, c) => sum + (c.progress?.progressPercentage || 0), 0) /
              courses.length
          )
        : 0,
  };

  if (authLoading || (loading && courses.length === 0)) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your courses...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Continue learning and track your progress
          </p>
        </div>

        {/* Stats Section */}
        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard
              icon="📚"
              label="Total Courses"
              value={stats.totalCourses}
              color="bg-blue-100"
            />
            <StatsCard
              icon="✓"
              label="Completed"
              value={stats.completedCourses}
              color="bg-green-100"
            />
            <StatsCard
              icon="▶"
              label="In Progress"
              value={stats.inProgressCourses}
              color="bg-yellow-100"
            />
            <StatsCard
              icon="⏱"
              label="Total Hours"
              value={Math.round(stats.totalHours / 60)}
              color="bg-purple-100"
            />
            <StatsCard
              icon="📊"
              label="Avg Progress"
              value={`${stats.averageProgress}%`}
              color="bg-pink-100"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Courses Section */}
        {courses.length > 0 ? (
          <>
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search courses by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {(["all", "in-progress", "completed"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterBy(filter)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        filterBy === filter
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter === "all"
                        ? "All"
                        : filter === "in-progress"
                        ? "In Progress"
                        : "Completed"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">No courses found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"
              />
            </svg>
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              No Enrolled Courses
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses yet. Start learning today!
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 101-1v1a1 1 0 10-1 1h1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 111-1v1a1 1 0 11-1 1H2zM5.757 5.757a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
              </svg>
              Explore Courses
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
