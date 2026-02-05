"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import contactService from "@/services/contactService";
import useToast from "@/components/hoock/toast";

function ContactContent() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      const res = await contactService.createContact(payload);
      if (res?.success) {
        showToast(
          t("contact.form.success") || "Message sent successfully",
          "success",
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        showToast(res?.message || "Failed to send message", "error");
      }
    } catch (err: any) {
      console.error("Contact submit error", err);
      showToast(err?.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 text-center bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t("contact.title")}
          </h1>
          <p className="hero-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="contact-section py-16  mx-auto px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="contact-form bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t("contact.name1")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.form.name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#51356e] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.form.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#51356e] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.form.phone") || "Phone"}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#51356e] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.form.subject")}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#51356e] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#51356e] focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#51356e] hover:bg-[#412a4f] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                  disabled={loading}
                >
                  {loading
                    ? t("contact.form.sending") || "Sending..."
                    : t("contact.form.send")}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info space-y-8">
              <div className="info-card bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {t("contact.info.title")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("contact.info.description")}
                </p>

                <div className="contact-details space-y-4">
                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-[#51356e1a] rounded-full flex items-center justify-center">
                      <MapPin
                        className="text-[#51356e]"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {t("contact.info.address")}
                      </h4>
                      <p className="text-gray-600">Dhaka, Bangladesh</p>
                    </div>
                  </div>

                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-[#51356e1a] rounded-full flex items-center justify-center">
                      <Phone
                        className="text-[#51356e]"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {t("contact.info.phone")}
                      </h4>
                      <p className="text-gray-600">+8801748-871225</p>
                    </div>
                  </div>

                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-[#51356e1a] rounded-full flex items-center justify-center">
                      <Mail
                        className="text-[#51356e]"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {t("contact.info.email")}
                      </h4>
                      <p className="text-gray-600">contact@shekhabo.com</p>
                    </div>
                  </div>

                  <div className="detail-item flex items-start space-x-4">
                    <div className="detail-icon w-8 h-8 bg-[#51356e1a] rounded-full flex items-center justify-center">
                      <Clock
                        className="text-[#51356e]"
                        size={18}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {t("contact.info.hours")}
                      </h4>
                      <p className="text-gray-600">
                        Sun - Thu: 9:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="support-card bg-[#51356e0f] p-8 rounded-xl border border-[#51356e1a]">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {t("contact.support.title")}
                </h3>
                <p className="text-gray-600">
                  {t("contact.support.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="map-placeholder h-96 rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3651.06365481476!2d90.38973659678958!3d23.7807475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sHouse%20364%2C%20Road%2027%2C%20Mohakhali%20DOHS%2C%20Dhaka%20-%201206!5e0!3m2!1sbn!2sbd!4v1760506262382!5m2!1sbn!2sbd"
              title="Shekhabo Location"
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
