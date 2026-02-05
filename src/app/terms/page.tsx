"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  Check,
  CheckCircle,
  CreditCard,
  RotateCw,
  BarChart2,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
  BookOpen,
  Mail,
} from "lucide-react";

function TermsContent() {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 text-center bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t("terms.title")}
          </h1>
          <p className="hero-subtitle text-lg text-gray-600">
            {t("terms.lastUpdated")}: December 2025
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="terms-content py-16  mx-auto px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            {/* Agreement to Terms */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.intro.title")}
              </h2>
              <div className="agreement-notice bg-white border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {t("terms.intro.content")}
                </p>
              </div>
            </div>

            {/* Description of Service */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.services.title")}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t("terms.services.content")}
              </p>
            </div>

            {/* User Accounts */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.userAccount.title")}
              </h2>
              <div className="account-requirements space-y-4">
                <div className="requirement bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <Check className="text-green-500" size={20} />
                    <p className="text-gray-700">
                      {t("terms.userAccount.registration")}
                    </p>
                  </div>
                </div>
                <div className="requirement bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <Check className="text-green-500" size={20} />
                    <p className="text-gray-700">
                      {t("terms.userAccount.security")}
                    </p>
                  </div>
                </div>
                <div className="requirement bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <Check className="text-green-500" size={20} />
                    <p className="text-gray-700">
                      {t("terms.userAccount.conduct")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.payment.title")}
              </h2>
              <div className="payment-terms space-y-4">
                <div className="payment-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <CreditCard className="text-orange-500" size={20} />
                  <p className="text-gray-700">{t("terms.payment.fees")}</p>
                </div>
                <div className="payment-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <RotateCw className="text-orange-500" size={20} />
                  <p className="text-gray-700">{t("terms.payment.refund")}</p>
                </div>
                <div className="payment-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <BarChart2 className="text-orange-500" size={20} />
                  <p className="text-gray-700">{t("terms.payment.changes")}</p>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.intellectual.title")}
              </h2>
              <div className="ip-terms space-y-6">
                <div className="ip-item bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Platform Content
                  </h3>
                  <p className="text-gray-700">
                    {t("terms.intellectual.ownership")}
                  </p>
                </div>
                <div className="ip-item bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Usage Restrictions
                  </h3>
                  <p className="text-gray-700">
                    {t("terms.intellectual.restrictions")}
                  </p>
                </div>
                <div className="ip-item bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    User Content
                  </h3>
                  <p className="text-gray-700">
                    {t("terms.intellectual.userContent")}
                  </p>
                </div>
              </div>
            </div>

            {/* Prohibited Uses */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.prohibited.title")}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t("terms.prohibited.content")}
              </p>
              <div className="prohibited-list space-y-3">
                <div className="prohibited-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <XCircle className="text-red-500" size={20} />
                  <p className="text-gray-700">
                    {t("terms.prohibited.harassment")}
                  </p>
                </div>
                <div className="prohibited-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <XCircle className="text-red-500" size={20} />
                  <p className="text-gray-700">
                    {t("terms.prohibited.piracy")}
                  </p>
                </div>
                <div className="prohibited-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <XCircle className="text-red-500" size={20} />
                  <p className="text-gray-700">{t("terms.prohibited.spam")}</p>
                </div>
                <div className="prohibited-item flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                  <XCircle className="text-red-500" size={20} />
                  <p className="text-gray-700">
                    {t("terms.prohibited.hacking")}
                  </p>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.termination.title")}
              </h2>
              <div className="termination-notice bg-white border border-gray-200 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-red-500" size={28} />
                  <p className="text-gray-700 leading-relaxed">
                    {t("terms.termination.content")}
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.limitation.title")}
              </h2>
              <div className="liability-notice bg-white border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {t("terms.limitation.content")}
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.changes.title")}
              </h2>
              <div className="changes-notice bg-white border border-gray-200 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FileText className="text-blue-500" size={28} />
                  <p className="text-gray-700 leading-relaxed">
                    {t("terms.changes.content")}
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright Issues */}
            <div className="terms-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Copyright Issues & DMCA Compliance
              </h2>
              <div className="copyright-content space-y-6">
                <div className="copyright-notice bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Copy className="text-red-500" size={28} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Copyright Protection
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        All content on Shekhabo.com, including but not limited
                        to course materials, videos, text, graphics, logos, and
                        software, is protected by copyright laws and
                        international treaties. Unauthorized use, reproduction,
                        or distribution of any content is strictly prohibited
                        and may result in legal action.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dmca-notice bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="text-blue-500" size={28} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        DMCA Notice & Takedown Policy
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We respect intellectual property rights and respond to
                        valid DMCA (Digital Millennium Copyright Act) notices.
                        If you believe your copyrighted work has been infringed
                        upon, please provide the following information:
                      </p>
                      <ul className="text-gray-700 space-y-2 ml-4">
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>
                            Identification of the copyrighted work claimed to be
                            infringed
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>
                            Location of the allegedly infringing material on our
                            platform
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>
                            Your contact information (name, address, phone,
                            email)
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>
                            A statement of good faith belief that the use is not
                            authorized
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>
                            A statement under penalty of perjury that the
                            information is accurate
                          </span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>Your physical or electronic signature</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="copyright-infringement bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-yellow-600" size={28} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Copyright Infringement Consequences
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Users found to be repeat copyright infringers will have
                        their accounts terminated. We reserve the right to
                        remove any content that violates copyright laws without
                        prior notice. Legal action may be pursued against users
                        who willfully infringe upon copyrighted materials.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="fair-use bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="text-green-600" size={28} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Fair Use & Educational Content
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        While we support educational fair use, all content
                        shared on our platform must comply with copyright laws.
                        Users are responsible for ensuring they have proper
                        rights or permissions for any content they upload or
                        share. Educational use does not automatically exempt
                        content from copyright restrictions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="contact-copyright bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="text-purple-600" size={28} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Copyright Contact Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        For copyright-related inquiries, DMCA notices, or to
                        report copyright infringement, please contact our
                        designated agent at:
                      </p>
                      <div className="mt-3 text-gray-700">
                        <p>
                          <strong>Email:</strong> contact@shekhabo.com
                        </p>
                        <p>
                          <strong>Subject Line:</strong> DMCA Notice - Copyright
                          Infringement
                        </p>
                        <p>
                          <strong>Response Time:</strong> We respond to valid
                          DMCA notices within 24-48 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="terms-section">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t("terms.contact.title")}
              </h2>
              <div className="contact-info bg-white border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {t("terms.contact.content")}
                </p>
              </div>
            </div>

            {/* Acceptance Footer */}
            <div className="acceptance-footer mt-16 pt-8 border-t border-gray-200">
              <div className="acceptance-notice bg-blue-50 border border-gray-200 p-6 rounded-lg text-center">
                <div className="acceptance-icon w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="text-green-500" size={36} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Terms Acceptance
                </h3>
                <p className="text-gray-700 text-sm">
                  By continuing to use Shekhabo.com, you acknowledge that you
                  have read, understood, and agree to be bound by these Terms of
                  Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Terms() {
  return (
    <MainLayout>
      <TermsContent />
    </MainLayout>
  );
}
