'use client';

import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/components/contexts/LanguageContext";

function PrivacyContent() {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 text-center bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t('privacy.title')}
          </h1>
          <p className="hero-subtitle text-lg text-gray-600">
            {t('privacy.lastUpdated')}: December 2024
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="privacy-content py-16  mx-auto px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            {/* Introduction */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.intro.title')}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t('privacy.intro.content')}
              </p>
            </div>

            {/* Data Collection */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.dataCollection.title')}
              </h2>
              <div className="space-y-4">
                <div className="data-type bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700">
                    <strong className="text-gray-800">
                      {t('privacy.dataCollection.personal')}
                    </strong>
                  </p>
                </div>
                <div className="data-type bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700">
                    <strong className="text-gray-800">
                      {t('privacy.dataCollection.usage')}
                    </strong>
                  </p>
                </div>
                <div className="data-type bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700">
                    <strong className="text-gray-800">
                      {t('privacy.dataCollection.technical')}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Data Use */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.dataUse.title')}
              </h2>
              <div className="use-cases space-y-3">
                <div className="use-case flex items-start space-x-3">
                  <span className="text-orange-500 text-xl">•</span>
                  <p className="text-gray-700">{t('privacy.dataUse.service')}</p>
                </div>
                <div className="use-case flex items-start space-x-3">
                  <span className="text-orange-500 text-xl">•</span>
                  <p className="text-gray-700">{t('privacy.dataUse.communication')}</p>
                </div>
                <div className="use-case flex items-start space-x-3">
                  <span className="text-orange-500 text-xl">•</span>
                  <p className="text-gray-700">{t('privacy.dataUse.personalization')}</p>
                </div>
                <div className="use-case flex items-start space-x-3">
                  <span className="text-orange-500 text-xl">•</span>
                  <p className="text-gray-700">{t('privacy.dataUse.analytics')}</p>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.dataSharing.title')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('privacy.dataSharing.content')}
              </p>
              <div className="sharing-conditions space-y-3">
                <div className="condition flex items-start space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <p className="text-gray-700">{t('privacy.dataSharing.consent')}</p>
                </div>
                <div className="condition flex items-start space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <p className="text-gray-700">{t('privacy.dataSharing.legal')}</p>
                </div>
                <div className="condition flex items-start space-x-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <p className="text-gray-700">{t('privacy.dataSharing.protection')}</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.security.title')}
              </h2>
              <div className="security-info bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.security.content')}
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.rights.title')}
              </h2>
              <div className="rights-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="right-card bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="right-icon w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-orange-500 text-2xl">👁️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Access</h3>
                  <p className="text-gray-600 text-sm">{t('privacy.rights.access')}</p>
                </div>

                <div className="right-card bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="right-icon w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-orange-500 text-2xl">✏️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Correction</h3>
                  <p className="text-gray-600 text-sm">{t('privacy.rights.correction')}</p>
                </div>

                <div className="right-card bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="right-icon w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-orange-500 text-2xl">🗑️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Deletion</h3>
                  <p className="text-gray-600 text-sm">{t('privacy.rights.deletion')}</p>
                </div>

                <div className="right-card bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <div className="right-icon w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-orange-500 text-2xl">📦</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Portability</h3>
                  <p className="text-gray-600 text-sm">{t('privacy.rights.portability')}</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="policy-section mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('privacy.contact.title')}
              </h2>
              <div className="contact-info bg-orange-50 border border-orange-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.contact.content')}
                </p>
              </div>
            </div>

            {/* Updates Notice */}
            <div className="policy-section">
              <div className="updates-notice bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <div className="notice-icon w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Policy Updates</h3>
                <p className="text-gray-700 text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Privacy() {
  return (
    <MainLayout>
      <PrivacyContent />
    </MainLayout>
  );
}
