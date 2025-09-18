/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/contexts/AuthContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { useRouter } from "next/navigation";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";

function StudentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const displayName = (() => {
    const u: any = user as any;
    const primary = typeof u?.name === 'string' && u.name.trim() ? u.name.trim() : '';
    const secondary = typeof u?.email === 'string' && u.email.trim() ? u.email.trim() : '';
    const roleStr = typeof u?.role === 'string' ? u.role : (typeof u?.role?.name === 'string' ? u.role.name : '');
    return primary || secondary || roleStr || 'User';
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

    Promise.all([
      userService.getEnrolledCourses(user.id),
      userService.getCourseStats(user.id),
      userService.getCompletedCertificates(user.id),
    ])
      .then(([coursesRes, statsRes, certRes]) => {
        const list = coursesRes.data?.courses || [];
        setEnrolledCourses(list);
        setCourses(list);
        setStats({
          enrolledCourses: (coursesRes.data?.courses || []).length,
          completed: statsRes.data?.completedCourses || 0,
          liveClasses: statsRes.data?.liveClasses || 0,
          certificates: (certRes.data || []).length,
          completedCourseIds: certRes.data?.map((c: any) => c.courseId) || [],
          inProgress: statsRes.data?.inProgressCourses || 0,
        });
        setCompletedCertificates(certRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);


  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("dashboard.student.title")}
              </h1>
              <p className="text-gray-600">
                Welcome back, {displayName}! Continue your learning journey.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="md">
                Browse Courses
              </Button>
              <Button size="md">Join Live Class</Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.enrolledCourses}
                </p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.inProgress} in progress
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Live Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.liveClasses}
                </p>
                <p className="text-sm text-blue-600 mt-1">Upcoming</p>
              </div>
              <div className="text-3xl">🎥</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.certificates}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.completed} completed
                </p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                My Courses
              </h2>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </div>
            <div className="space-y-6">
              {enrolledCourses.map((course: any, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {typeof (course as any)?.instructor === 'string'
                          ? (course as any).instructor
                          : ((course as any)?.instructor?.name
                              || [ (course as any)?.instructor?.firstName, (course as any)?.instructor?.lastName ]
                                  .filter(Boolean)
                                  .join(' ')
                              || (course as any)?.instructorId
                              || 'Instructor')}
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

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>Next: {course.nextLesson || "-"}</span>
                    <span>{course.timeLeft || "-"}</span>
                  </div>

                  <div className="flex space-x-2">
                    {stats.completedCourseIds.includes(course.id) ? (
                      <Button
                        size="md"
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
                        onClick={() => {
                          setLastSelectedCourseId(String(course.id));
                          router.push(`/dashboard/student/learn/${course.id}`);
                        }}
                      >
                        Continue Learning
                      </Button>
                    )}
                    <Button size="md" variant="outline" onClick={() => {
                      setLastSelectedCourseId(String(course.id));
                      router.push(`/courses/${course.id}`);
                    }}>
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
