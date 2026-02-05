"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { XCircle, AlertCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { paymentService } from "@/services/paymentService";

export default function PaymentFailPage() {
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
    const errorMessage = params.get("error");

    setPaymentDetails({
      tranId,
      amount,
      currency: currency || "BDT",
      status,
      errorMessage,
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
          errorMessage: prev.errorMessage || "Payment failed",
        }));
      }

      setLoading(false);
    } catch (e: any) {
      console.error("Payment verification error:", e);
      // Still show fail page with URL params
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 w-full py-12 lg:min-h-screen lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto p-6 text-center">
            <div className="space-y-6">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>

              {/* Error Message */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Failed
                </h1>
                <p className="text-gray-600">
                  We couldn't process your payment
                </p>
              </div>

              {/* Error Details */}
              {paymentDetails && (
                <div className="bg-red-50 rounded-lg p-4 space-y-2 text-left">
                  {paymentDetails.errorMessage && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Error Details:
                        </p>
                        <p className="text-sm text-red-700">
                          {paymentDetails.errorMessage}
                        </p>
                      </div>
                    </div>
                  )}
                  {paymentDetails.tranId && (
                    <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">
                        {paymentDetails.tranId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Common Reasons */}
              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Common reasons for payment failure:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Insufficient funds in your account</li>
                  <li>Incorrect card details or expired card</li>
                  <li>Bank declined the transaction</li>
                  <li>Network connectivity issues</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Link href="/courses">
                  <Button variant="outline" className="w-full py-3 mb-3">
                    Browse Other Courses
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline" className="w-full py-3">
                    Contact Support
                  </Button>
                </Link>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 pt-4">
                If you continue to experience issues, please contact our support
                team
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
