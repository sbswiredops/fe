/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Tag } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { courseService } from "@/services/courseService";
import { paymentService } from "@/services/paymentService";
import { promoService, PromoType } from "@/services/promoService";
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
  const [promoCode, setPromoCode] = useState<string>("");
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    amount: number;
    type: PromoType;
  } | null>(null);
  const [promoOpen, setPromoOpen] = useState<boolean>(false);
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
          // If a promo was marked to be cleared (we're returning from payment),
          // remove persisted promo BEFORE attempting to restore it. Also check
          // `returning_from_payment` in case `promo_to_clear` wasn't set.
          try {
            if (typeof window !== "undefined") {
              // Always clear any persisted promo on load so reload starts clean.
              try {
                for (let i = 0; i < sessionStorage.length; i++) {
                  const key = sessionStorage.key(i);
                  if (!key) continue;
                  if (key.startsWith("promo_")) {
                    try {
                      sessionStorage.removeItem(key);
                    } catch (er) {}
                  }
                }
              } catch (er) {}
              const urlParams = new URLSearchParams(window.location.search);
              const isPaymentReturn =
                urlParams.has("tran_id") ||
                urlParams.has("status") ||
                urlParams.has("val_id") ||
                urlParams.has("bank_tran_id");
              const promoToClear = sessionStorage.getItem("promo_to_clear");
              const promoClearOnLoad =
                sessionStorage.getItem("promo_clear_on_load") === "1";
              const returningFromPayment = sessionStorage.getItem(
                "returning_from_payment",
              );
              // If there's a returning flag or payment callback params, aggressively clear
              // promo_* keys to avoid stale promo showing after payment.
              if (returningFromPayment || isPaymentReturn || promoClearOnLoad) {
                try {
                  for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (!key) continue;
                    if (key.startsWith("promo_")) {
                      try {
                        sessionStorage.removeItem(key);
                      } catch (er) {}
                    }
                  }
                } catch (er) {}
                try {
                  sessionStorage.removeItem("promo_to_clear");
                } catch (er) {}
                try {
                  sessionStorage.removeItem("promo_clear_on_load");
                } catch (er) {}
                try {
                  sessionStorage.removeItem("returning_from_payment");
                } catch (er) {}
                try {
                  setPromoApplied(null);
                  setPromoCode("");
                  setPromoError("");
                } catch (er) {}
              }

              const shouldClear =
                promoToClear === "promo_" + mapped.id ||
                returningFromPayment === String(mapped.id) ||
                isPaymentReturn ||
                promoClearOnLoad;

              if (shouldClear) {
                try {
                  // always remove the explicit promo_<id> key
                  sessionStorage.removeItem("promo_" + mapped.id);
                } catch (err) {}
                try {
                  if (promoToClear) sessionStorage.removeItem(promoToClear);
                } catch (err) {}
                try {
                  sessionStorage.removeItem("promo_to_clear");
                } catch (err) {}
                try {
                  sessionStorage.removeItem("promo_clear_on_load");
                } catch (err) {}
                try {
                  sessionStorage.removeItem("returning_from_payment");
                } catch (err) {}
                try {
                  setPromoApplied(null);
                  setPromoCode("");
                  setPromoError("");
                } catch (err) {}
              }
            }
          } catch (err) {}

          // Do not restore promo from storage; keep reload state clean.
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
      const basePrice = Number(
        hasDiscount ? course.discountPrice : (course.price ?? 0),
      );

      const finalAmount = (() => {
        if (!promoApplied) return basePrice;
        if (promoApplied.type === PromoType.PERCENTAGE) {
          return Math.max(
            0,
            Math.round(basePrice * (1 - promoApplied.amount / 100)),
          );
        }
        return Math.max(0, Math.round(basePrice - promoApplied.amount));
      })();

      // Validate required fields
      if (!user.email) {
        throw new Error("Email is required for payment");
      }

      if (basePrice <= 0) {
        throw new Error("Invalid course price");
      }

      // Initialize SSLCommerz payment (include promoCode so backend can validate/apply)
      const paymentResponse = await paymentService.initSSLCommerzPayment({
        courseId: course.id,
        amount: basePrice,
        currency: "BDT",
        customerName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email.split("@")[0] || "Student",
        customerEmail: user.email,
        customerPhone: user.phone || "01700000000",
        productName: course.title,
        productCategory: promoApplied?.code || "",
        promoCode: promoApplied?.code || undefined,
      });

      // Check if payment initialization was successful
      if (paymentResponse.success && paymentResponse.data) {
        // Check if the backend returned a failure (e.g., already enrolled or promo invalid)
        if (paymentResponse.data.success === false) {
          const msg =
            paymentResponse.data.message || "Payment initialization failed";
          // if it's a promo-related error, surface it in the promo UI and clear persisted promo
          if (
            msg.toLowerCase().includes("promo") ||
            msg.toLowerCase().includes("invalid")
          ) {
            setPromoError(msg);
            // remove persisted promo for this course to avoid stuck UI
            try {
              if (course?.id) {
                sessionStorage.removeItem("promo_" + course.id);
              }
              sessionStorage.removeItem("promo_to_clear");
            } catch (err) {}
            setPromoApplied(null);
            setEnrolling(false);
            return;
          }
          throw new Error(msg);
        }

        // Check if gateway URL exists
        if (!paymentResponse.data.GatewayPageURL) {
          throw new Error("Payment gateway URL not found");
        }

        // Mark that we're redirecting to payment for this course so we can detect return
        try {
          if (course?.id) {
            sessionStorage.setItem("returning_from_payment", String(course.id));
            // store the promo session key so we can reliably clear it when the user returns
            try {
              sessionStorage.setItem("promo_to_clear", "promo_" + course.id);
            } catch (err) {}
            try {
              sessionStorage.setItem("promo_clear_on_load", "1");
            } catch (err) {}
          }
        } catch (err) {}

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

  // Detect when user returns from external payment page and reload to refresh state
  useEffect(() => {
    const handleReturn = () => {
      try {
        const cid = sessionStorage.getItem("returning_from_payment");
        const promoKey = sessionStorage.getItem("promo_to_clear");
        if (!cid && !promoKey) return;
        // remove promo cache for this course (prefer explicit promo_to_clear key)
        try {
          if (promoKey) {
            sessionStorage.removeItem(promoKey);
          } else if (cid) {
            sessionStorage.removeItem("promo_" + cid);
          }
        } catch (err) {}
        try {
          sessionStorage.removeItem("returning_from_payment");
        } catch (err) {}
        try {
          sessionStorage.removeItem("promo_to_clear");
        } catch (err) {}
        // clear in-memory promo state before reload (defensive)
        try {
          setPromoApplied(null);
          setPromoCode("");
          setPromoError("");
          setApplyingPromo(false);
        } catch (err) {}
        // reload to refresh enrollment/payment status
        window.location.reload();
      } catch (err) {
        // fallback: reload anyway
        try {
          window.location.reload();
        } catch (e) {}
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") handleReturn();
    };

    window.addEventListener("focus", handleReturn);
    window.addEventListener("pageshow", handleReturn as any);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", handleReturn);
      window.removeEventListener("pageshow", handleReturn as any);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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

                    // Base price considers backend discountPrice if present
                    const basePrice = Number(
                      hasDiscount ? course.discountPrice : (course.price ?? 0),
                    );

                    // Compute displayed price after promo
                    const displayedPrice = (() => {
                      if (!promoApplied) return basePrice;
                      if (promoApplied.type === PromoType.PERCENTAGE) {
                        const pct = promoApplied.amount; // e.g. 20 means 20%
                        return Math.max(
                          0,
                          Math.round(basePrice * (1 - pct / 100)),
                        );
                      }
                      // flat
                      return Math.max(
                        0,
                        Math.round(basePrice - promoApplied.amount),
                      );
                    })();

                    return (
                      <div className="space-y-3">
                        {hasDiscount && (
                          <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                            {course.discountPercentage}% OFF
                          </div>
                        )}

                        {/* Promo input (collapsed by default) */}
                        <div className="pt-2">
                          {!promoOpen ? (
                            <button
                              onClick={() => setPromoOpen(true)}
                              className="flex items-center gap-2 text-[#51356e] hover:underline text-sm"
                              aria-expanded={promoOpen}
                            >
                              <Tag className="w-4 h-4 text-[#51356e]" />
                              <span>Add promo code</span>
                            </button>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-gray-600 block">
                                  Promo code
                                </label>
                                <button
                                  onClick={() => setPromoOpen(false)}
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Close
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  value={promoCode}
                                  onChange={(e) => setPromoCode(e.target.value)}
                                  placeholder="XXXXXXXX"
                                  className="flex-1 border border-[#e6dff6] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#51356e]/30 text-black placeholder:text-gray-400"
                                />
                                <button
                                  onClick={async () => {
                                    if (!course) return;
                                    setApplyingPromo(true);
                                    setPromoError("");
                                    const code = String(promoCode || "")
                                      .trim()
                                      .toUpperCase();
                                    await new Promise((r) =>
                                      setTimeout(r, 250),
                                    );

                                    if (!code) {
                                      setPromoError("Enter promo code");
                                      setPromoApplied(null);
                                      setApplyingPromo(false);
                                      return;
                                    }

                                    try {
                                      // Call server-side promo validation (send code and courseId; do NOT send price)
                                      const res =
                                        await promoService.validatePromo({
                                          code,
                                          courseId: course.id,
                                        });

                                      const data = (res as any)?.data ?? res;

                                      // Expecting server to indicate validity and either
                                      // a type+value or an appliedAmount (final price)
                                      if (
                                        data == null ||
                                        data.valid === false
                                      ) {
                                        setPromoError(
                                          data?.message || "Invalid promo code",
                                        );
                                        setPromoApplied(null);
                                        setApplyingPromo(false);
                                        return;
                                      }

                                      // If server returns finalAmount or discountAmount, trust server-calculated values
                                      if (
                                        data.finalAmount != null ||
                                        data.discountAmount != null
                                      ) {
                                        const base = Number(
                                          course.discountPrice &&
                                            Number(course.discountPrice) <
                                              Number(course.price)
                                            ? course.discountPrice
                                            : (course.price ?? 0),
                                        );

                                        if (data.discountAmount != null) {
                                          const discount = Math.max(
                                            0,
                                            Math.round(
                                              Number(data.discountAmount),
                                            ),
                                          );
                                          const appliedObj = {
                                            code,
                                            amount: discount,
                                            type: PromoType.FIXED,
                                          };
                                          setPromoApplied(appliedObj);
                                          setApplyingPromo(false);
                                          return;
                                        }

                                        if (data.finalAmount != null) {
                                          const applied = Number(
                                            data.finalAmount,
                                          );
                                          const discount = Math.max(
                                            0,
                                            Math.round(base - applied),
                                          );
                                          const appliedObj = {
                                            code,
                                            amount: discount,
                                            type: PromoType.FIXED,
                                          };
                                          setPromoApplied(appliedObj);
                                          setApplyingPromo(false);
                                          return;
                                        }
                                      }

                                      // If server returns appliedAmount (final price), compute flat discount
                                      if (data.appliedAmount != null) {
                                        const base = Number(
                                          course.discountPrice &&
                                            Number(course.discountPrice) <
                                              Number(course.price)
                                            ? course.discountPrice
                                            : (course.price ?? 0),
                                        );
                                        const applied = Number(
                                          data.appliedAmount,
                                        );
                                        const discount = Math.max(
                                          0,
                                          Math.round(base - applied),
                                        );
                                        const appliedObj = {
                                          code,
                                          amount: discount,
                                          type: PromoType.FIXED,
                                        };
                                        setPromoApplied(appliedObj);
                                        setApplyingPromo(false);
                                        return;
                                      }

                                      // If server returns explicit type/value
                                      const t = String(
                                        data.type || data.promoType || "",
                                      ).toLowerCase();
                                      const val = Number(
                                        data.value ?? data.amount ?? 0,
                                      );

                                      let promoType: PromoType =
                                        PromoType.FIXED;
                                      if (
                                        t === "percentage" ||
                                        t === "percent"
                                      ) {
                                        promoType = PromoType.PERCENTAGE;
                                      } else if (
                                        t === "fixed" ||
                                        t === "flat"
                                      ) {
                                        promoType = PromoType.FIXED;
                                      }

                                      if (val > 0) {
                                        const appliedObj: {
                                          code: string;
                                          amount: number;
                                          type: PromoType;
                                        } = {
                                          code,
                                          amount: val,
                                          type: promoType,
                                        };
                                        setPromoApplied(appliedObj);
                                      } else {
                                        setPromoError(
                                          data?.message ||
                                            "Invalid promo response",
                                        );
                                        setPromoApplied(null);
                                      }
                                    } catch (err: any) {
                                      setPromoError(
                                        err?.message ||
                                          "Failed to validate promo code",
                                      );
                                      setPromoApplied(null);
                                    } finally {
                                      setApplyingPromo(false);
                                    }
                                  }}
                                  className="bg-[#51356e] hover:bg-[#8e67b6] text-white px-4 rounded-md disabled:opacity-60"
                                  disabled={applyingPromo}
                                >
                                  {applyingPromo ? "Applying..." : "Apply"}
                                </button>
                              </div>
                              {promoError && (
                                <p className="text-sm text-red-600 mt-2">
                                  {promoError}
                                </p>
                              )}
                              {promoApplied && (
                                <p className="text-sm text-[#51356e] mt-2">
                                  Promo '{promoApplied.code}' applied
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price display */}
                        <div className="flex items-baseline gap-3">
                          <div className="text-3xl font-bold text-[#51356e]">
                            ৳{Number(displayedPrice).toFixed(0)}
                          </div>
                          {hasDiscount && (
                            <div className="text-lg line-through text-gray-400">
                              ৳{Number(course.price ?? 0).toFixed(0)}
                            </div>
                          )}
                        </div>

                        {/* Show discount breakdown if promo applied */}
                        {promoApplied && (
                          <div className="text-sm text-gray-700">
                            <div>Original price: ৳{basePrice.toFixed(0)}</div>
                            <div className="text-red-700">
                              Discount:{" "}
                              {promoApplied.type === PromoType.PERCENTAGE
                                ? `${promoApplied.amount}%`
                                : `৳${promoApplied.amount}`}
                            </div>
                          </div>
                        )}
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
                      variant="primary"
                      className="w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
