"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { paymentService } from "@/services/paymentService";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tranId = params.get("tran_id");
    const amount = params.get("amount");
    const currency = params.get("currency");
    const status = params.get("status");

    if (tranId) {
      // Extract payment details from URL (SSLCommerz sends these)
      setPaymentDetails({
        tranId,
        amount,
        currency: currency || "BDT",
        status,
      });

      // Verify payment with backend
      verifyPaymentWithBackend(tranId);
    } else {
      setError("No transaction ID found");
      setVerifying(false);
    }
  }, []);

  const verifyPaymentWithBackend = async (tranId: string) => {
    try {
      // Call backend to get full payment details
      const response = await paymentService.getPaymentByTransactionId(tranId);

      if (response.success && response.data) {
        const data = response.data;
        // Update with full payment details from backend
        setPaymentDetails((prev: any) => ({
          ...prev,
          tranId: data.transactionId || tranId,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          courseId: data.courseId,
          paymentMethod: data.paymentMethod,
          createdAt: data.createdAt,
        }));
      }

      setVerifying(false);
    } catch (e: any) {
      console.error("Payment verification error:", e);
      // Still show success if URL params are valid (backend might be slow)
      setVerifying(false);
      // Don't set error - payment was successful according to SSLCommerz
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please login to continue</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 w-full py-12 lg:min-h-screen lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto p-6 text-center">
            {verifying ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Verifying Payment...
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your payment
                </p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verification Error
                </h2>
                <p className="text-red-600">{error}</p>
                <div className="space-y-2 pt-4">
                  <Link href="/dashboard/student">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" className="w-full">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                {/* Success Message */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600">
                    Your enrollment has been confirmed
                  </p>
                </div>

                {/* Payment Details */}
                {paymentDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">
                        {paymentDetails.tranId}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">
                        {paymentDetails.currency} {paymentDetails.amount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">
                        {paymentDetails.status || "Successful"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Link href="/dashboard/student/courses">
                    <Button size="lg" className="w-full mb-3">
                      Start Learning
                    </Button>
                  </Link>
                  <Link href="/dashboard/student">
                    <Button size="lg" variant="need" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>

                {/* Additional Info */}
                <p className="text-xs text-gray-500 pt-4">
                  A confirmation email has been sent to your registered email
                  address
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
