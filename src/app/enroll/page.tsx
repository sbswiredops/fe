"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { courseService } from "@/services/courseService";
import { UserService } from "@/services/userService";
import type { Course } from "@/components/types";

const userService = new UserService();

export default function EnrollPage() {
  const router = useRouter();
  // replaced useSearchParams() (caused SSR/suspense error) with client-side URL parsing
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setCourseId(params.get("courseId") || "");
  }, []);

  const { user } = useAuth();
  const { courses: enrolledCourses, setCourses } = useEnrolledCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!courseId) {
      router.replace("/courses");
      return;
    }

    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourseById(String(courseId));
        const c = (res as any)?.data;
        if (!ignore && c) {
          const instructorName =
            c?.instructor?.name ||
            [c?.instructor?.firstName, c?.instructor?.lastName]
              .filter(Boolean)
              .join(" ") ||
            c?.instructorId ||
            "Instructor";
          const categoryName =
            typeof c?.category === "object" && c?.category?.name
              ? c.category.name
              : typeof c?.category === "string"
              ? c.category
              : "General";
          const created = c?.createdAt ? new Date(c.createdAt) : new Date();
          const durationStr =
            typeof c?.totalDuration === "string" && c?.totalDuration
              ? c.totalDuration
              : typeof c?.duration === "number"
              ? `${c.duration} min`
              : String(c?.duration || "");

          const mapped: Course = {
            id: String(c.id),
            title: String(c.title || ""),
            description: String(c.description || ""),
            instructor: String(instructorName),
            instructorId: String(c.instructorId || c?.instructor?.id || ""),
            price: Number(c.price ?? 0),
            duration: durationStr,
            thumbnail: c.thumbnail || "/placeholder-course.jpg",
            category: String(categoryName),
            enrollmentCount: Number(c.enrollmentCount ?? 0),
            rating: Number(c.rating ?? 0),
            createdAt: created,
            sections: Array.isArray(c.sections) ? c.sections : [],
            courseIntroVideo: c?.courseIntroVideo || "",
          };
          setCourse(mapped);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load course.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [courseId, router]);

  useEffect(() => {
    if (!user) {
      router.replace(`/login?next=/enroll?courseId=${courseId}`);
    }
  }, [user, router, courseId]);

  const alreadyEnrolled =
    !!courseId && !!getById && !!getById(String(courseId));

  const handleEnroll = async () => {
    if (!user || !course) {
      router.push(`/login?next=/enroll?courseId=${courseId}`);
      return;
    }
    if (alreadyEnrolled) {
      router.replace(`/dashboard/student/learn/${courseId}`);
      return;
    }

    setEnrolling(true);
    setError("");

    try {
      const svc: any = userService as any;
      const uid = user.id;

      let res: any = null;
      if (typeof svc.enrollInCourse === "function") {
        res = await svc.enrollInCourse(uid, course.id);
      } else if (typeof svc.enrollCourse === "function") {
        res = await svc.enrollCourse(uid, course.id);
      } else if (typeof svc.enroll === "function") {
        res = await svc.enroll(uid, course.id);
      } else {
        throw new Error(
          "Enrollment method not found on UserService. Please implement enrollInCourse(userId, courseId)."
        );
      }

      const ok =
        (res && (res.success === true || res.status === "ok")) ||
        !res?.success === undefined
          ? true
          : Boolean(res?.success);

      if (!ok) {
        const msg =
          res?.message ||
          res?.error ||
          "Enrollment failed. Please try again later.";
        throw new Error(msg);
      }

      const has = enrolledCourses.some((c: any) => String(c.id) === String(course.id));
      if (!has) {
        setCourses([...enrolledCourses, course] as any);
      }

      router.replace(`/enroll/success?courseId=${course.id}`);
    } catch (e: any) {
      setError(e?.message || "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <MainLayout>
      <div className="enroll-page-outer bg-gray-50 w-full py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-10">
            <nav className="mb-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              {" / "}
              <Link href="/courses" className="hover:text-blue-600">
                Courses
              </Link>
              {" / "}
              <span className="text-gray-900">Enroll</span>
            </nav>

            {loading ? (
              <div className="rounded-lg border bg-white p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : !course ? (
              <div className="rounded-lg border bg-white p-6">
                Course not found.
              </div>
            ) : (
              <div className="enroll-card bg-white p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="relative">
                    <Image
                      src={course.thumbnail ?? "/placeholder-course.jpg"}
                      alt={course.title}
                      className="course-thumbnail w-full"
                      width={800}
                      height={450}
                      priority
                    />
                    <div className="absolute top-3 left-3 price-badge">
                      {typeof course.category === "string"
                        ? course.category
                        : typeof course.category === "object" && course.category?.name
                        ? course.category.name
                        : ""}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="mt-4 flex items-center gap-3">
                      <div className="text-sm text-gray-500">Instructor</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {course.instructor}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      {course.enrolledStudents} students • {course.rating}⭐
                    </div>

                    <div className="flex items-start justify-between mt-4">
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                          {course.title}
                        </h2>
                        <p className="mt-2 text-gray-600">
                          {course.description || "No description provided."}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-3xl font-extrabold text-gray-900">
                          ৳{Number(course.price ?? 0)}
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {course.duration}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg border bg-gray-50">
                        <div className="text-sm font-medium text-gray-700">
                          Certificate
                        </div>
                        <div className="text-xs text-gray-500">
                          Validated certificate on completion
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-gray-50">
                        <div className="text-sm font-medium text-gray-700">
                          1:1 Mentor
                        </div>
                        <div className="text-xs text-gray-500">
                          Personalized guidance
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border bg-gray-50">
                        <div className="text-sm font-medium text-gray-700">
                          Job Support
                        </div>
                        <div className="text-xs text-gray-500">
                          CV review & interview prep
                        </div>
                      </div>
                    </div>

                    {alreadyEnrolled && (
                      <div className="mt-5 rounded-md border border-green-200 bg-green-50 p-3 text-green-700">
                        You are already enrolled in this course.{" "}
                        <Link
                          href={`/dashboard/student/learn/${courseId}`}
                          className="underline"
                        >
                          Go to course
                        </Link>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        className={`enroll-cta-primary btn-animate w-full sm:w-auto`}
                        size="lg"
                        disabled={enrolling || alreadyEnrolled}
                        onClick={handleEnroll}
                      >
                        {enrolling
                          ? "Enrolling..."
                          : alreadyEnrolled
                          ? "Continue Course"
                          : "Confirm Enrollment"}
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                      By enrolling, you agree to the Terms and acknowledge the
                      Privacy Policy.
                    </p>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        What you'll learn
                      </h3>
                      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li>• Practical, hands-on projects</li>
                        <li>• Industry-relevant skills</li>
                        <li>• Resume & interview support</li>
                        <li>• Lifetime access to resources</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
