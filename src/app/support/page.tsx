"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

function SupportContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");

  const faqData = {
    general: [
      {
        question: "What is Shekhabo, and how does it work?",
        answer:
          "Shekhabo is an online learning and career support platform that helps students, fresh graduates, and professionals develop in-demand skills through interactive courses, expert mentorship, and job placement support.",
      },
      {
        question:
          "Who can join—fresh graduates, professionals, or career changers?",
        answer:
          "Shekhabo courses are open to fresh graduates, working professionals, and career changers. Whether you’re starting out or upskilling, there’s a suitable path for you.",
      },
      {
        question: "Do I need prior knowledge or skills to get started?",
        answer:
          "No prior experience is needed for most beginner-friendly courses. Advanced programs may require some background knowledge, which will be clearly mentioned in the course details.",
      },
      {
        question:
          "Are your certificates recognized by employers and industry partners?",
        answer:
          "Yes, Shekhabo’s certificates are industry-recognized and valued by employers across multiple sectors.",
      },
      {
        question:
          "Does Shekhabo provide career counseling or interview preparation?",
        answer:
          "Yes, learners receive career guidance, resume-building support, and mock interview sessions to help with job readiness.",
      },
      {
        question: "Does Shekhabo help with job and internship placements?",
        answer:
          "Yes, through our hiring network, Shekhabo offers job and internship opportunities to qualified learners.",
      },
    ],
    courses: [
      {
        question: "Are classes live, self-paced, or both?",
        answer:
          "Shekhabo offers live instructor-led classes, recorded sessions, and self-paced modules for flexible learning.",
      },
      {
        question:
          "Do the courses include real-world projects and hands-on learning?",
        answer:
          "Yes, Shekhabo courses feature practical projects, enabling you to build a portfolio with real-world experience.",
      },
      {
        question: "Will I be guided by mentors or industry experts?",
        answer:
          "Absolutely. Expert mentors provide feedback, guidance, and career advice throughout your learning experience.",
      },
      {
        question: "Can I watch recorded sessions if I miss a live class?",
        answer:
          "Yes, all live sessions are recorded and accessible anytime for review.",
      },
      {
        question: "Can I ask trainers questions during or after classes?",
        answer:
          "Yes, learners can ask questions during live classes or post them in Shekhabo’s discussion forums for trainer feedback.",
      },
      {
        question: "Will I get a certificate after completing a course?",
        answer:
          "Yes, every Shekhabo course awards a digital certificate upon successful completion.",
      },
    ],
    technical: [
      {
        question:
          "How can I contact the support team if I face technical issues?",
        answer:
          "You can contact the Shekhabo support team via email, live chat, or phone for quick assistance. (See contact details above.)",
      },
      {
        question: "Where can I find your terms of service and privacy policy?",
        answer:
          "They are available at the bottom of the Shekhabo website and in your account dashboard.",
      },
      {
        question: "Can I share my account with friends or family?",
        answer:
          "No, Shekhabo accounts are individual and non-transferable to maintain a personalized learning experience.",
      },
    ],
    billing: [
      {
        question: "How do I sign up for a course?",
        answer:
          'Go to your desired course page, click "Enroll Now," and complete the quick registration process. (A sign-up tutorial video can be added.)',
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "Shekhabo accepts Bkash, Nagad, credit/debit cards, and other secure online payment options.",
      },
      {
        question: "Do you offer installment plans or student discounts?",
        answer:
          "While installments are not currently available, student discounts apply to selected courses.",
      },
      {
        question: "How much do courses cost?",
        answer:
          "Prices vary by program and are listed on each course page. (Include “View All Courses” link.)",
      },
      {
        question:
          "What is your refund policy if I’m not satisfied with a course?",
        answer:
          "Refunds are available within a defined period. Details are on the refund policy page.",
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - Improved responsive spacing */}
      <section className="hero-section py-12 sm:py-16 md:py-20 text-center bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
            {t("support.title")}
          </h1>
          <p className="hero-subtitle text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t("support.subtitle")}
          </p>
        </div>
      </section>

      {/* FAQ Section - Improved responsive layout */}
      <section className="faq-section py-10 sm:py-12 md:py-16 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
              {t("support.faq.title")}
            </h2>

            {/* FAQ Tabs - Improved mobile layout */}
            <div className="faq-tabs flex flex-wrap justify-center gap-2 mb-8 px-2">
              {["general", "courses", "technical", "billing"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors duration-300 ${
                    activeTab === tab
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t(`support.faq.${tab}`)}
                </button>
              ))}
            </div>

            {/* FAQ Content - Improved spacing and readability */}
            <div className="faq-content space-y-4 max-w-4xl mx-auto px-4 sm:px-6">
              {faqData[activeTab as keyof typeof faqData].map((faq, index) => (
                <div
                  key={index}
                  className="faq-item bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <h3 className="faq-question text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                    {faq.question}
                  </h3>
                  <p className="faq-answer text-sm sm:text-base text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Support - Improved responsive design */}
      <section className="emergency-support py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="emergency-card bg-red-50 border border-red-200 p-4 sm:p-6 md:p-8 rounded-xl max-w-4xl mx-auto text-center">
            <div className="emergency-icon w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Emergency Support
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              If you're experiencing critical issues that prevent you from
              accessing your courses or account, please contact our emergency
              support line immediately.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors duration-300 text-sm sm:text-base"
            >
              Contact Emergency Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Support() {
  return (
    <MainLayout>
      <SupportContent />
    </MainLayout>
  );
}
