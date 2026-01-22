"use client";

import MainLayout from "@/components/layout/MainLayout";
import { AlertTriangle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="hero-section py-20 text-center bg-gray-50">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Refund Policy
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Platform Name: <span className="font-semibold">Shekhabo</span>
            </p>
            <p className="text-lg text-gray-600">
              Currency:{" "}
              <span className="font-semibold">Bangladeshi Taka (BDT)</span>
            </p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-16 mx-auto px-4 sm:px-10 lg:px-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {/* Introduction */}
              <div className="policy-section mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Introduction
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Shekhabo is committed to providing quality educational
                  services. This Refund Policy outlines the conditions under
                  which users may request a refund for courses, programs,
                  subscriptions, or bundled offerings purchased on the Shekhabo
                  platform. By making a purchase, you agree to this Refund
                  Policy.
                </p>
              </div>

              {/* Scope of Policy */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  1. Scope of Policy
                </h2>
                <p className="text-gray-600 mb-2">
                  This policy applies to all offerings on Shekhabo, including
                  but not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Self-paced online courses</li>
                  <li>Live or instructor-led classes</li>
                  <li>Subscriptions</li>
                  <li>Course bundles or packaged programs</li>
                </ul>
              </div>

              {/* Refund Eligibility */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  2. Refund Eligibility
                </h2>
                <p className="text-gray-600 mb-2">
                  A refund request will be considered only if all of the
                  following conditions are met:
                </p>
                <ul className="list-decimal pl-6 text-gray-700">
                  <li>
                    The refund request is submitted within{" "}
                    <span className="font-semibold">48 hours</span> of the
                    original purchase date.
                  </li>
                  <li>
                    The user has not completed or accessed more than{" "}
                    <span className="font-semibold">20%</span> of the total
                    course content.
                  </li>
                  <li>
                    The course or service has not been fully consumed,
                    downloaded, or materially used.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-2">
                  2.1. Non-Refundable Situations
                </h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    The refund request is made after 48 hours from the purchase
                    time.
                  </li>
                  <li>
                    The user has completed or accessed more than 20% of the
                    course content.
                  </li>
                  <li>
                    Course materials (videos, PDFs, recordings, or resources)
                    have been downloaded or shared.
                  </li>
                  <li>
                    The purchase relates to certificates already issued or
                    assessments already completed.
                  </li>
                  <li>
                    The user has a history of repeated or abusive refund
                    requests.
                  </li>
                  <li>
                    The purchase was made under promotional, discounted, or
                    special offer pricing, unless required by applicable law.
                  </li>
                </ul>
              </div>

              {/* Refund Request Process */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  3. Refund Request Process
                </h2>
                <ul className="list-decimal pl-6 text-gray-700">
                  <li>
                    Submit a refund request through Shekhabo’s official support
                    channel or dashboard.
                  </li>
                  <li>
                    Provide valid purchase details (registered email,
                    transaction ID, course name).
                  </li>
                  <li>Clearly state the reason for the refund request.</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Shekhabo reserves the right to request additional information
                  to verify eligibility.
                </p>
              </div>

              {/* Deductions & Non-Refundable Charges */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  4. Deductions & Non-Refundable Charges
                </h2>
                <p className="text-gray-600 mb-2">
                  Approved refunds are subject to deductions for non-recoverable
                  operational costs, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Payment gateway or transaction processing fees</li>
                  <li>Bank or mobile financial service transfer charges</li>
                  <li>SSL, platform, and system maintenance costs</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  These charges are non-refundable and will be deducted from the
                  refund amount before processing.
                </p>
              </div>

              {/* Refund Processing Time & Method */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  5. Refund Processing Time & Method
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    Approved refunds will be processed within{" "}
                    <span className="font-semibold">10 business days</span> from
                    the date of approval.
                  </li>
                  <li>
                    Refunds will be issued only through:
                    <ul className="list-disc pl-6">
                      <li>Bank transfer</li>
                      <li>
                        Mobile Financial Services (such as bKash, Nagad, Rocket,
                        etc.)
                      </li>
                    </ul>
                  </li>
                  <li>Cash refunds are not supported.</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Processing time may vary depending on banking or mobile
                  financial service providers.
                </p>
              </div>

              {/* Fraud Prevention & Policy Abuse */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  6. Fraud Prevention & Policy Abuse
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    Shekhabo reserves the right to deny refund requests
                    suspected to involve fraud, misuse, or policy abuse.
                  </li>
                  <li>
                    Suspend or terminate accounts found to be violating platform
                    policies.
                  </li>
                  <li>
                    Refuse future refund requests from users with repeated
                    refund behavior.
                  </li>
                </ul>
                <p className="text-gray-600 mt-2">
                  All decisions made by Shekhabo in such cases shall be final.
                </p>
              </div>

              {/* Exceptional Circumstances */}
              <div className="policy-section mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  7. Exceptional Circumstances
                </h2>
                <p className="text-gray-600 mb-2">In rare cases such as:</p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Verified technical failure from Shekhabo’s side</li>
                  <li>Proven payment errors</li>
                  <li>Serious medical or emergency situations</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  Refund requests may be reviewed at Shekhabo’s sole discretion.
                  Approval in such cases is not guaranteed and does not set a
                  precedent.
                </p>
              </div>

              {/* Changes to This Policy */}
              <div className="policy-section">
                <div className="updates-notice bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="notice-icon w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-yellow-600" size={16} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Changes to This Policy
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Shekhabo reserves the right to update or modify this Refund
                    Policy at any time without prior notice. Changes will be
                    effective immediately upon posting on the website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
