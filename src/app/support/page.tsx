'use client';

import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useState } from "react";

function SupportContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');

  const faqData = {
    general: [
      {
        question: "How do I create an account?",
        answer: "To create an account, click on the 'Register' button and fill out the required information."
      },
      {
        question: "Is there a mobile app available?",
        answer: "Currently, we offer a web-based platform that works on all devices including mobile browsers."
      }
    ],
    courses: [
      {
        question: "How do I enroll in a course?",
        answer: "Browse our course catalog, select a course, and click 'Enroll Now' to get started."
      },
      {
        question: "Can I get a refund?",
        answer: "Refund policies vary by course. Please check the specific course page for refund terms."
      }
    ],
    technical: [
      {
        question: "I'm having trouble accessing my course",
        answer: "Try clearing your browser cache or contact our technical support team."
      },
      {
        question: "Video not playing properly",
        answer: "Ensure you have a stable internet connection and try refreshing the page."
      }
    ],
    billing: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards, mobile banking, and bank transfers."
      },
      {
        question: "How do I update my payment information?",
        answer: "You can update your payment details in your account settings under 'Billing'."
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 text-center bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t('support.title')}
          </h1>
          <p className="hero-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
            {t('support.subtitle')}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-16  mx-auto px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              {t('support.faq.title')}
            </h2>

            {/* FAQ Tabs */}
            <div className="faq-tabs flex flex-wrap justify-center mb-8 space-x-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                  activeTab === 'general'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('support.faq.general')}
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                  activeTab === 'courses'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('support.faq.courses')}
              </button>
              <button
                onClick={() => setActiveTab('technical')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                  activeTab === 'technical'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('support.faq.technical')}
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                  activeTab === 'billing'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('support.faq.billing')}
              </button>
            </div>

            {/* FAQ Content */}
            <div className="faq-content space-y-4 max-w-4xl mx-auto">
              {faqData[activeTab as keyof typeof faqData].map((faq, index) => (
                <div key={index} className="faq-item bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h3 className="faq-question text-lg font-semibold text-gray-800 mb-3">
                    {faq.question}
                  </h3>
                  <p className="faq-answer text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Options Section */}
      <section className="support-options-section py-16 bg-gray-50  mx-auto px-4 sm:px-10 lg:px-50" >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Help Desk */}
            <div className="support-card bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="support-icon w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-blue-500 text-3xl">🎫</span>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                {t('support.helpDesk.title')}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {t('support.helpDesk.description')}
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                {t('support.helpDesk.submitTicket')}
              </button>
            </div>

            {/* Resources */}
            <div className="support-card bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="support-icon w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-green-500 text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                {t('support.resources.title')}
              </h3>
              <div className="resources-list space-y-3">
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors duration-300">
                  {t('support.resources.userGuide')}
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors duration-300">
                  {t('support.resources.videoTutorials')}
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors duration-300">
                  {t('support.resources.downloads')}
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors duration-300">
                  {t('support.resources.systemRequirements')}
                </a>
              </div>
            </div>

            {/* Contact Support */}
            <div className="support-card bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="support-icon w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-orange-500 text-3xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                {t('support.contact.title')}
              </h3>
              <div className="contact-options space-y-4">
                <div className="contact-option">
                  <h4 className="font-semibold text-gray-800">{t('support.contact.phone')}</h4>
                  <p className="text-gray-600">+880 1234-567890</p>
                </div>
                <div className="contact-option">
                  <h4 className="font-semibold text-gray-800">{t('support.contact.email')}</h4>
                  <p className="text-gray-600">support@shekhabo.com</p>
                </div>
                <div className="contact-option">
                  <h4 className="font-semibold text-gray-800">{t('support.contact.chat')}</h4>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
                    Start Live Chat
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                {t('support.contact.hours')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="emergency-support py-16">
        <div className="container mx-auto px-4">
          <div className="emergency-card bg-red-50 border border-red-200 p-8 rounded-xl max-w-4xl mx-auto text-center">
            <div className="emergency-icon w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="text-red-500 text-3xl">🚨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Emergency Support</h3>
            <p className="text-gray-600 mb-6">
              If you're experiencing critical issues that prevent you from accessing your courses or account, 
              please contact our emergency support line immediately.
            </p>
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
              Contact Emergency Support
            </button>
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
