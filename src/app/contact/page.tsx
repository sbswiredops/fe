'use client';

import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useState } from "react";

function ContactContent() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 text-center bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t('contact.title')}
          </h1>
          <p className="hero-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="contact-section py-16  mx-auto px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="contact-form bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('contact.form.name')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  {t('contact.form.send')}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info space-y-8">
              <div className="info-card bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('contact.info.title')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('contact.info.description')}
                </p>

                <div className="contact-details space-y-4">
                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-500 text-lg">📍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{t('contact.info.address')}</h4>
                      <p className="text-gray-600">Dhaka, Bangladesh</p>
                    </div>
                  </div>

                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-500 text-lg">📞</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{t('contact.info.phone')}</h4>
                      <p className="text-gray-600">+880 1234-567890</p>
                    </div>
                  </div>

                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-500 text-lg">📧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{t('contact.info.email')}</h4>
                      <p className="text-gray-600">contact@shekhabo.com</p>
                    </div>
                  </div>

                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-500 text-lg">🕒</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{t('contact.info.hours')}</h4>
                      <p className="text-gray-600">Sun - Thu: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="support-card bg-orange-50 p-8 rounded-xl border border-orange-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('contact.support.title')}</h3>
                <p className="text-gray-600">
                  {t('contact.support.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="map-section py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="map-placeholder bg-gray-300 h-96 rounded-xl flex items-center justify-center">
            <p className="text-gray-600 text-lg">Map Integration Placeholder</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Contact() {
  return (
    <MainLayout>
      <ContactContent />
    </MainLayout>
  );
}
