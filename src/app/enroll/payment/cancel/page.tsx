"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { paymentService } from "@/services/paymentService";

export default function PaymentCancelPage() {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tranId = params.get("tran_id");
    const amount = params.get("amount");
    const currency = params.get("currency");
    const status = params.get("status");

    setPaymentDetails({
      tranId,
      amount,
      currency: currency || "BDT",
      status,
    });

    // Verify payment with backend if tranId exists
    if (tranId) {
      verifyPaymentWithBackend(tranId);
    } else {
      setLoading(false);
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
        }));
      }

      setLoading(false);
    } catch (e: any) {
      console.error("Payment verification error:", e);
      // Still show cancel page with URL params
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="space-y-6">
              {/* Cancel Icon */}
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>

              {/* Cancel Message */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Cancelled
                </h1>
                <p className="text-gray-600">
                  You have cancelled the payment process
                </p>
              </div>

              {/* Payment Details */}
              {paymentDetails && paymentDetails.amount && (
                <div className="bg-yellow-50 rounded-lg p-4 space-y-2 text-left border border-yellow-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Cancelled Transaction Details:
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">
                      {paymentDetails.currency} {paymentDetails.amount}
                    </span>
                  </div>
                  {paymentDetails.tranId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">
                        {paymentDetails.tranId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Information Box */}
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>What happened?</strong>
                </p>
                <p className="text-sm text-gray-600">
                  You cancelled the payment before it was completed. No charges
                  have been made to your account.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  onClick={() => router.back()}
                >
                  Try Again
                </Button>
                <Link href="/courses">
                  <Button variant="outline" className="w-full py-3">
                    Browse Courses
                  </Button>
                </Link>
                <Link href="/dashboard/student">
                  <Button variant="outline" className="w-full py-3">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {/* Help Text */}
              <div className="pt-4 space-y-2">
                <p className="text-xs text-gray-500">
                  Need help? Contact our support team
                </p>
                <Link href="/support">
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Contact Support →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
