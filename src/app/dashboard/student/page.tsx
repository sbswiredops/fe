/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Video, Award } from "lucide-react";

import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/contexts/AuthContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { courseService } from "@/services/courseService";
import { useRouter } from "next/navigation";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";

function StudentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const displayName = (() => {
    const u: any = user as any;
    const primary =
      typeof u?.name === "string" && u.name.trim() ? u.name.trim() : "";
    const secondary =
      typeof u?.email === "string" && u.email.trim() ? u.email.trim() : "";
    const roleStr =
      typeof u?.role === "string"
        ? u.role
        : typeof u?.role?.name === "string"
        ? u.role.name
        : "";
    return primary || secondary || roleStr || "User";
  })();
  const userService = new UserService();
  const router = useRouter();
  const { setCourses, setLastSelectedCourseId } = useEnrolledCourses();

  const [stats, setStats] = useState<any>({
    enrolledCourses: 0,
    completed: 0,
    liveClasses: 0,
    certificates: 0,
    completedCourseIds: [],
    inProgress: 0,
  });
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCertificates, setCompletedCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    (async () => {
      try {
        const [coursesRes, statsRes, certRes] = await Promise.all([
          userService.getEnrolledCourses(user.id),
          userService.getCourseStats(user.id),
          userService.getCompletedCertificates(user.id),
        ]);

        const list = coursesRes.data?.courses || [];

        // Fetch lesson progress for each course's sections
        const { lessonService: lessonSvc } = await import("@/services/lessonService");

        const enhancedList = await Promise.all(
          list.map(async (course: any) => {
            const sections = course.sections || [];
            const totalLessons = sections.reduce(
              (sum: number, sec: any) => sum + (sec.lessons?.length || 0),
              0
            );

            // Fetch progress for each section
            const progressMap: Record<string, boolean> = {};
            for (const section of sections) {
              try {
                const progressRes = await lessonSvc.getAllLessonsProgress({
                  sectionId: section.id,
                  page: 1,
                  limit: 100,
                });
                if (progressRes.data) {
                  progressRes.data.forEach((p: any) => {
                    if (p.lessonId && p.isVideoWatched) {
                      progressMap[p.lessonId] = true;
                    }
                  });
                }
              } catch (err) {
                console.warn(`Failed to fetch progress for section ${section.id}:`, err);
              }
            }

            // Calculate completed lessons and next lesson
            let completedLessons = 0;
            let nextLesson = "-";
            const sortedSections = sections.sort(
              (a: any, b: any) => (a.orderIndex || a.order || 0) - (b.orderIndex || b.order || 0)
            );

            for (const section of sortedSections) {
              const lessons = (section.lessons || []).sort(
                (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)
              );
              for (const lesson of lessons) {
                const isCompleted = progressMap[lesson.id] === true;
                if (isCompleted) {
                  completedLessons++;
                } else if (nextLesson === "-") {
                  nextLesson = lesson.title || "Next Lesson";
                }
              }
            }

            // Calculate progress percentage
            const progress =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            // Calculate time left (duration is in minutes)
            const totalDuration = typeof course.duration === "string"
              ? parseInt(course.duration) || 0
              : course.duration || 0;

            const completedDuration =
              completedLessons > 0 && totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * totalDuration)
                : 0;

            const timeLeftMinutes = Math.max(0, totalDuration - completedDuration);
            const timeLeftStr =
              timeLeftMinutes > 0
                ? timeLeftMinutes >= 60
                  ? `${Math.round(timeLeftMinutes / 60)}h left`
                  : `${timeLeftMinutes}m left`
                : "Completed";

            return {
              ...course,
              progress,
              nextLesson,
              timeLeft: timeLeftStr,
            };
          })
        );

        setEnrolledCourses(enhancedList);
        setCourses(enhancedList);
        setStats({
          enrolledCourses: (coursesRes.data?.courses || []).length,
          completed: statsRes.data?.completedCourses || 0,
          liveClasses: statsRes.data?.liveClasses || 0,
          certificates: (certRes.data || []).length,
          completedCourseIds: certRes.data?.map((c: any) => c.courseId) || [],
          inProgress: statsRes.data?.inProgressCourses || 0,
        });
        setCompletedCertificates(certRes.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("dashboard.student.title")}
              </h1>
              <p className="text-gray-600 flex items-center gap-2 flex-wrap">
                Welcome back, <span className="font-bold">{displayName}</span>
                <BookOpen size={18} className="inline text-blue-500" /> Continue
                your learning journey.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                <BookOpen size={18} className="inline text-blue-500 mr-1" />{" "}
                Browse Courses
              </Button>
              {/* <Button size="md" className="w-full sm:w-auto">
                <Video size={18} className="inline text-purple-500 mr-1" /> Join
                Live Class
              </Button> */}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-red-gradient"
            style={{
              background:
                "linear-gradient(270deg, #ff5858, #ff2525, #ff6e7f, #b31217, #ff5858)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <style>{`
          @keyframes redGradientMove {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
          .animate-red-gradient {
            animation: redGradientMove 8s ease infinite;
          }
        `}</style>
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Enrolled Courses
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {stats.enrolledCourses}
                </p>
              </div>
              <div className="text-3xl">
                <BookOpen size={32} className="text-white" />
              </div>
            </div>
          </div>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-blue-gradient"
            style={{
              background:
                "linear-gradient(270deg, #2193b0, #6dd5ed, #1e3c72, #2980b9, #2193b0)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <style>{`
          @keyframes blueGradientMove {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
          .animate-blue-gradient {
            animation: blueGradientMove 8s ease infinite;
          }
        `}</style>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Completed
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {stats.completed}
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  {stats.inProgress} in progress
                </p>
              </div>
              <div className="text-3xl">
                <CheckCircle2 size={32} className="text-white" />
              </div>
            </div>
          </div>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-green-gradient"
            style={{
              background:
                "linear-gradient(270deg, #43e97b, #66bb6a, #b2ff59, #00ff99, #00e676, #388e3c, #43e97b)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <style>{`
          @keyframes greenGradientMove {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
          .animate-green-gradient {
            animation: greenGradientMove 8s ease infinite;
          }
        `}</style>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Live Classes
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {stats.liveClasses}
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  Upcoming
                </p>
              </div>
              <div className="text-3xl">
                <Video size={32} className="text-white" />
              </div>
            </div>
          </div>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-purple-gradient"
            style={{
              background:
                "linear-gradient(270deg, #a4508b, #5f0a87, #c471f5, #833ab4, #e040fb, #8e24aa, #a4508b)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <style>{`
            @keyframes purpleGradientMove {
              0% {background-position:0% 50%}
              50% {background-position:100% 50%}
              100% {background-position:0% 50%}
            }
            .animate-purple-gradient {
              animation: purpleGradientMove 8s ease infinite;
            }
          `}</style>
            <style>{`
          @keyframes yellowGradientMove {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
          .animate-yellow-gradient {
            animation: yellowGradientMove 8s ease infinite;
          }
        `}</style>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Certificates
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {stats.certificates}
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  {stats.completed} completed
                </p>
              </div>
              <div className="text-3xl">
                <Award size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                My Courses
              </h2>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <BookOpen size={16} className="inline text-blue-500 mr-1" />{" "}
                View All
              </Button>
            </div>
            <div className="space-y-6">
              {enrolledCourses.map((course: any, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by{" "}
                        {typeof (course as any)?.instructor === "string"
                          ? (course as any).instructor
                          : (course as any)?.instructor?.name ||
                            [
                              (course as any)?.instructor?.firstName,
                              (course as any)?.instructor?.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ") ||
                            (course as any)?.instructorId ||
                            "Instructor"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stats.completedCourseIds.includes(course.id)
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {stats.completedCourseIds.includes(course.id)
                        ? "Completed"
                        : "In Progress"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 mb-3 gap-2">
                    <span>Next: {course.nextLesson || "-"}</span>
                    <span>{course.timeLeft || "-"}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {stats.completedCourseIds.includes(course.id) ? (
                      <Button
                        size="md"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setLastSelectedCourseId(String(course.id));
                          router.push(`/dashboard/student/learn/${course.id}`);
                        }}
                      >
                        Review Course
                      </Button>
                    ) : (
                      <Button
                        size="md"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setLastSelectedCourseId(String(course.id));
                          router.push(`/dashboard/student/learn/${course.id}`);
                        }}
                      >
                        Continue Learning
                      </Button>
                    )}
                    <Button
                      size="md"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setLastSelectedCourseId(String(course.id));
                        router.push(`/courses/${course.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {enrolledCourses.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No enrolled courses found.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Live Classes */}
            {/* You can fetch and render upcoming classes from API here */}
            {/* Recent Achievements */}
            {/* You can fetch and render achievements from API here */}
          </div>
        </div>

        {/* Learning Path Recommendations */}
        {/* You can fetch and render recommended courses from API here */}
      </div>
    </DashboardLayout>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
