"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { courseService } from "@/services/courseService";
import { paymentService } from "@/services/paymentService";
import type { Course } from "@/components/types";

export default function EnrollPage() {
  const router = useRouter();
  // replaced useSearchParams() (caused SSR/suspense error) with client-side URL parsing
  const [courseSku, setCourseSku] = useState<string>("");
  const [hasLoadedParams, setHasLoadedParams] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sku = params.get("courseSku") || "";
    setCourseSku(sku);
    setHasLoadedParams(true);
  }, []);

  const { user } = useAuth();
  const {
    courses: enrolledCourses,
    setCourses,
    getById,
  } = useEnrolledCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [showAlreadyEnrolledModal, setShowAlreadyEnrolledModal] =
    useState<boolean>(false);

  useEffect(() => {
    // Only redirect if we've loaded params and still no courseSku
    if (!hasLoadedParams) {
      return;
    }

    if (!courseSku) {
      router.replace("/courses");
      return;
    }

    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // Fetch course by SKU
        const res = await courseService.getCourseBySku(String(courseSku));
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
            instructor: c?.instructor ?? {
              id: String(c?.instructorId || ""),
              name: String(instructorName),
            },
            instructorId: String(c.instructorId || c?.instructor?.id || ""),
            price: Number(c.price ?? 0),
            discountPrice: c.discountPrice
              ? Number(c.discountPrice)
              : undefined,
            discountPercentage: c.discountPercentage
              ? Number(c.discountPercentage)
              : undefined,
            duration: durationStr,
            thumbnail: c.thumbnail || "",
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
  }, [courseSku, router, hasLoadedParams]);

  useEffect(() => {
    // Wait until params are loaded before checking auth
    if (!hasLoadedParams) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=/enroll?courseSku=${courseSku}`);
    }
  }, [user, router, courseSku, hasLoadedParams]);

  const alreadyEnrolled =
    !!course?.id && !!getById && !!getById(String(course.id));

  const handleEnroll = async () => {
    if (!user || !course) {
      router.push(`/login?next=/enroll?courseSku=${courseSku}`);
      return;
    }

    // Double check if already enrolled
    if (alreadyEnrolled) {
      setShowAlreadyEnrolledModal(true);
      return;
    }

    setEnrolling(true);
    setError("");

    try {
      // Calculate final amount (with discount if available)
      const hasDiscount =
        course.discountPrice &&
        course.price &&
        Number(course.discountPrice) < Number(course.price);
      const finalAmount = hasDiscount
        ? Number(course.discountPrice)
        : Number(course.price ?? 0);

      // Validate required fields
      if (!user.email) {
        throw new Error("Email is required for payment");
      }

      if (finalAmount <= 0) {
        throw new Error("Invalid course price");
      }

      // Initialize SSLCommerz payment
      const paymentResponse = await paymentService.initSSLCommerzPayment({
        courseId: course.id,
        amount: finalAmount,
        currency: "BDT",
        customerName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email.split("@")[0] || "Student",
        customerEmail: user.email,
        customerPhone: user.phone || "01700000000",
      });

      // Check if payment initialization was successful
      if (paymentResponse.success && paymentResponse.data) {
        // Check if the backend returned a failure (e.g., already enrolled)
        if (paymentResponse.data.success === false) {
          throw new Error(
            paymentResponse.data.message || "Payment initialization failed",
          );
        }

        // Check if gateway URL exists
        if (!paymentResponse.data.GatewayPageURL) {
          throw new Error("Payment gateway URL not found");
        }

        // Redirect to SSLCommerz payment gateway
        window.location.href = paymentResponse.data.GatewayPageURL;
      } else {
        throw new Error(
          paymentResponse.message || "Failed to initialize payment",
        );
      }
    } catch (e: any) {
      console.error("Payment initialization error:", e);

      // The error message comes directly from our API client's handleResponse
      const errorMessage =
        e?.message || "Payment initialization failed. Please try again.";

      // Show modal if already enrolled error
      if (errorMessage.toLowerCase().includes("already enrolled")) {
        setShowAlreadyEnrolledModal(true);
      } else {
        setError(errorMessage);
      }
      setEnrolling(false);
    }
  };

  return (
    <MainLayout>
      <div className="enroll-page-outer bg-gray-50 w-full py-12 lg:min-h-screen lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="bg-white rounded-xl p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-48 bg-gray-200 rounded-lg" />
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
              <p className="font-semibold mb-2">Error</p>
              {error}
            </div>
          ) : !course ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600 text-lg">Course not found.</p>
              <Link href="/courses">
                <Button className="mt-4">Back to Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {course.thumbnail &&
                course.thumbnail !== "/placeholder-course.jpg" ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    width={400}
                    height={200}
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-blue-400 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Course Name */}
                <h2 className="text-xl font-bold text-gray-900">
                  {course.title}
                </h2>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-gray-200">
                  {(() => {
                    const hasDiscount =
                      course.discountPrice &&
                      course.price &&
                      Number(course.discountPrice) < Number(course.price);

                    return (
                      <div className="space-y-2">
                        {hasDiscount && (
                          <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                            {course.discountPercentage}% OFF
                          </div>
                        )}
                        <div className="flex items-baseline gap-3">
                          <div className="text-3xl font-bold text-blue-600">
                            ৳
                            {Number(
                              hasDiscount
                                ? course.discountPrice
                                : (course.price ?? 0),
                            ).toFixed(0)}
                          </div>
                          {hasDiscount && (
                            <div className="text-lg line-through text-gray-400">
                              ৳{Number(course.price ?? 0).toFixed(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Already Enrolled Message */}
                {alreadyEnrolled && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
                    You are already enrolled in this course.
                  </div>
                )}

                {/* Terms Checkbox */}
                {!alreadyEnrolled && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                    <label
                      htmlFor="terms-checkbox"
                      className="text-xs text-gray-600 cursor-pointer select-none leading-tight"
                    >
                      By enrolling, you agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-2 pt-4">
                  {alreadyEnrolled ? (
                    <Link href={`/dashboard/student/learn/${course?.id}`}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
                        Continue Course
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={enrolling || !agreedToTerms || alreadyEnrolled}
                      onClick={handleEnroll}
                    >
                      {enrolling
                        ? "Processing Payment..."
                        : alreadyEnrolled
                          ? "Already Enrolled"
                          : "Proceed to Payment"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full py-3"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Already Enrolled Modal */}
      <ConfirmationModal
        isOpen={showAlreadyEnrolledModal}
        onClose={() => setShowAlreadyEnrolledModal(false)}
        onConfirm={() => {
          setShowAlreadyEnrolledModal(false);
          if (course?.id) {
            router.push(`/dashboard/student/learn/${course.id}`);
          }
        }}
        title="Already Enrolled"
        message="You are already enrolled in this course. Would you like to continue learning?"
        confirmText="Continue Learning"
        cancelText="Close"
        type="info"
      />
    </MainLayout>
  );
}
