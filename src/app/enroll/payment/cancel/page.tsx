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
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 w-full py-12 lg:min-h-screen lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto p-4 text-center">
            <div className="space-y-3">
              {/* Cancel Icon */}
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>

              {/* Cancel Message */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  Payment Cancelled
                </h1>
                <p className="text-xs text-gray-600">
                  You have cancelled the payment process
                </p>
              </div>

              {/* Payment Details */}
              {paymentDetails && paymentDetails.amount && (
                <div className="bg-yellow-50 rounded-lg p-2.5 space-y-1 text-left border border-yellow-200">
                  <p className="text-xs font-medium text-gray-900 mb-1.5">
                    Cancelled Transaction Details:
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">
                      {paymentDetails.currency} {paymentDetails.amount}
                    </span>
                  </div>
                  {paymentDetails.tranId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">
                        {paymentDetails.tranId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Information Box */}
              <div className="bg-gray-50 rounded-lg p-2.5 text-left">
                <p className="text-xs text-gray-700 mb-1.5">
                  <strong>What happened?</strong>
                </p>
                <p className="text-xs text-gray-600">
                  You cancelled the payment before it was completed. No charges
                  have been made to your account.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/courses" className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    Browse Courses
                  </Button>
                </Link>
                <Link href="/dashboard/student" className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {/* Help Text */}
              <div className="pt-1 space-y-0.5">
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
