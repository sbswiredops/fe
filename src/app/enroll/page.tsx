"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const params = useSearchParams();
  const courseId = useMemo(() => params.get("courseId") || "", [params]);
  const { user } = useAuth();
  const { setCourses, getById } = useEnrolledCourses();

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
          const categoryName = c?.category?.name || c?.category || "General";
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
            enrolledStudents: Number(c.enrollmentCount ?? 0),
            rating: Number(c.rating ?? 0),
            createdAt: created,
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
      // Try common method names on UserService for enrolling
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

      // Update local enrolled courses context
      setCourses((prev => {
        const has = prev.some((c: any) => String(c.id) === String(course.id));
        if (has) return prev;
        return [...prev, course];
      })(getById ? [getById(String(course.id))].filter(Boolean) : []));

      router.replace(`/enroll/success?courseId=${course.id}`);
    } catch (e: any) {
      setError(e?.message || "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/courses" className="hover:text-blue-600">
            Courses
          </Link>{" "}
          / <span className="text-gray-900">Enroll</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Enroll</h1>

        {loading ? (
          <div className="rounded-lg border bg-white p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
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
          <div className="rounded-xl border bg-white p-6 space-y-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Course</div>
              <div className="text-lg font-semibold text-gray-900">
                {course.title}
              </div>
              <div className="text-sm text-gray-600">
                by {String(course.instructor || "Instructor")}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-2xl font-bold text-blue-600">
                  ৳{Number(course.price ?? 0)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Duration</div>
                <div className="text-base font-semibold text-gray-900">
                  {course.duration}
                </div>
              </div>
            </div>

            {alreadyEnrolled && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-green-700">
                You are already enrolled in this course.
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                className="btn-hover text-white"
                size="lg"
                style={{
                  backgroundColor: "var(--color-text-primary)",
                  borderColor: "var(--color-text-primary)",
                }}
                disabled={enrolling || alreadyEnrolled}
                onClick={handleEnroll}
              >
                {enrolling ? "Enrolling..." : "Confirm Enrollment"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              By enrolling, you agree to the Terms and acknowledge the Privacy
              Policy.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
