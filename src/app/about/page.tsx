"use client";

import { useLanguage } from "@/components/contexts/LanguageContext";
import MainLayout from "@/components/layout/MainLayout";
import {
  GraduationCap,
  Building2,
  Banknote,
  Phone,
  Laptop,
  Ruler,
  BarChart3,
  Factory,
  User,
  Briefcase,
  Globe2,
  BookOpen,
  Target,
  Star,
  Map,
  Bolt,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

function AboutContent() {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen ">
      {/* Hero Section */}
      <section className="hero-section py-20 px-4 sm:px-10 lg:px-50 text-center">
        <div className="container mx-auto px-4">
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t("about.title")}
          </h1>
          <p className="hero-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section py-16 px-4 sm:px-10 lg:px-50 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-4xl font-bold text-center text-black mb-8">
            {t("about.ourStory.title")}
          </h2>
          <div className="story-intro text-center mb-12">
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {t("about.ourStory.intro")}
            </p>
            <p className="text-lg text-gray-600 mt-4">
              {t("about.ourStory.rippleEffect")}
            </p>
          </div>

          <div className="story-benefits grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="benefit-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 border border-gray-200 hover:border-gray-300">
              <div className="benefit-icon w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                <User className="text-blue-600 w-7 h-7" />
              </div>
              <h3 className="benefit-title text-xl font-bold text-blue-800 mb-4">
                {t("about.ourStory.forLearners.title")}
              </h3>
              <p className="benefit-description text-gray-600">
                {t("about.ourStory.forLearners.description")}
              </p>
            </div>

            <div className="benefit-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 border border-gray-200 hover:border-gray-300">
              <div className="benefit-icon w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                <Briefcase className="text-green-600 w-7 h-7" />
              </div>
              <h3 className="benefit-title text-xl font-bold text-green-800 mb-4">
                {t("about.ourStory.forEmployers.title")}
              </h3>
              <p className="benefit-description text-gray-600">
                {t("about.ourStory.forEmployers.description")}
              </p>
            </div>

            <div className="benefit-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 border border-gray-200 hover:border-gray-300">
              <div className="benefit-icon w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                <Globe2 className="text-purple-600 w-7 h-7" />
              </div>
              <h3 className="benefit-title text-xl font-bold text-purple-800 mb-4">
                {t("about.ourStory.forSociety.title")}
              </h3>
              <p className="benefit-description text-gray-600">
                {t("about.ourStory.forSociety.description")}
              </p>
            </div>

            <div className="benefit-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transform transition-all duration-300 border border-gray-200 hover:border-gray-300">
              <div className="benefit-icon w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                <BookOpen className="text-amber-600 w-7 h-7" />
              </div>
              <h3 className="benefit-title text-xl font-bold text-amber-800 mb-4">
                {t("about.ourStory.forEducation.title")}
              </h3>
              <p className="benefit-description text-gray-600">
                {t("about.ourStory.forEducation.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="mission-vision-section py-16 px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="mission-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <div className="mission-icon w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto hover:scale-110 hover:rotate-12 transition-all duration-300">
                <Target className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="mission-title text-2xl font-bold text-center text-red-800 mb-6">
                {t("about.mission.title")}
              </h3>
              <p className="mission-description text-gray-600 text-center leading-relaxed">
                {t("about.mission.description")}
              </p>
            </div>

            <div className="vision-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <div className="vision-icon w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto hover:scale-110 hover:rotate-12 transition-all duration-300">
                <Star className="text-yellow-600 w-8 h-8" />
              </div>
              <h3 className="vision-title text-2xl font-bold text-center text-yellow-800 mb-6">
                {t("about.vision.title")}
              </h3>
              <p className="vision-description text-gray-600 text-center leading-relaxed">
                {t("about.vision.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Failure Management Section */}
      <section className="failure-management-section py-16 px-4 sm:px-10 lg:px-50 bg-gray-50 ">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-6">
            {t("about.failureManagement.title")}
          </h2>
          <p className="text-center text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            {t("about.failureManagement.subtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Map className="text-blue-600 w-8 h-8 mb-4" />
              <h3 className="text-xl text-black font-bold text-center mb-2">
                {t("about.failureManagement.cards.personalReview.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.failureManagement.cards.personalReview.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Bolt className="text-pink-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.failureManagement.cards.extraSupport.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.failureManagement.cards.extraSupport.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <TrendingUp className="text-green-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.failureManagement.cards.customRoadmap.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.failureManagement.cards.customRoadmap.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <UserCheck className="text-orange-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.failureManagement.cards.mentorship.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.failureManagement.cards.mentorship.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <BarChart3 className="text-violet-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.failureManagement.cards.mindsetMotivation.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.failureManagement.cards.mindsetMotivation.description")} {" "}
                <span className="font-bold text-gray-900">
                  {t("about.failureManagement.cards.mindsetMotivation.emphasis")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="industry-workshops-section py-16 px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-black mb-6">
            {t("about.industryWorkshops.title")}
          </h2>
          <p className="text-center text-lg text-gray-700 mb-12 max-w-4xl mx-auto">
            {t("about.industryWorkshops.subtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Building2 className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                {t("about.industryWorkshops.items.unilever.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("about.industryWorkshops.items.unilever.description")}
              </p>
              <span className="italic text-gray-500 text-sm">
                {t("about.industryWorkshops.items.unilever.meta")}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Bolt className="text-pink-800 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                {t("about.industryWorkshops.items.batb.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("about.industryWorkshops.items.batb.description")}
              </p>
              <span className="italic text-gray-500 text-sm">
                {t("about.industryWorkshops.items.batb.meta")}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Banknote className="text-green-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                {t("about.industryWorkshops.items.banking.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("about.industryWorkshops.items.banking.description")}
              </p>
              <span className="italic text-gray-500 text-sm">
                {t("about.industryWorkshops.items.banking.meta")}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Laptop className="text-orange-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                {t("about.industryWorkshops.items.it.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("about.industryWorkshops.items.it.description")}
              </p>
              <span className="italic text-gray-500 text-sm">
                {t("about.industryWorkshops.items.it.meta")}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Ruler className="text-purple-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                {t("about.industryWorkshops.items.engineering.title")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("about.industryWorkshops.items.engineering.description")}
              </p>
              <span className="italic text-gray-500 text-sm">
                {t("about.industryWorkshops.items.engineering.meta")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose-us-section py-16 px-4 sm:px-10 lg:px-50 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-black mb-10">
            {t("about.whyChooseUs.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Map className="text-blue-600 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.whyChooseUs.cards.structuredRoadmaps.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.whyChooseUs.cards.structuredRoadmaps.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Bolt className="text-pink-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.whyChooseUs.cards.industrySpecificHacks.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.whyChooseUs.cards.industrySpecificHacks.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <TrendingUp className="text-green-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.whyChooseUs.cards.completeCareerJourney.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.whyChooseUs.cards.completeCareerJourney.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <UserCheck className="text-orange-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.whyChooseUs.cards.prospectManagerSupport.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.whyChooseUs.cards.prospectManagerSupport.description")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Factory className="text-violet-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.whyChooseUs.cards.industryBuiltCourses.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.whyChooseUs.cards.industryBuiltCourses.description")} {" "}
                <span className="font-bold">
                  {t("about.whyChooseUs.cards.industryBuiltCourses.emphasis")}
                </span>
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Users className="text-blue-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.whyChooseUs.cards.noOneLeftBehind.title")}
              </h3>
              <p className="text-base text-center text-gray-700">
                {t("about.whyChooseUs.cards.noOneLeftBehind.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="industries-career-section py-16 px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-black mb-10">
            {t("about.industriesCareerPaths.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <GraduationCap className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.bcsPrep.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Building2 className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.multinationals.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Banknote className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.mtoBanking.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Phone className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.bpoPrep.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Laptop className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.itSoftware.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Ruler className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.engineering.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <BarChart3 className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.careerGuidelines.title")}
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Factory className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                {t("about.industriesCareerPaths.items.industryWorkshops.title")}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA: gradient on centered card, section padded so white shows at sides */}
      <section className="cta-section py-20  px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto text-center">
          <div
            className="cta-content backdrop-blur-sm rounded-2xl p-12 max-w-4xl mx-auto shadow-lg overflow-hidden"
          style={{
              background:
                "linear-gradient(135deg, rgb(14,165,233) 0%, rgb(99,102,241) 50%, rgb(236,72,153) 100%)",
            }}
          >
            <h2 className="cta-title text-3xl md:text-4xl font-bold text-white mb-6">
              {t("about.promise.title")}
            </h2>
            <p className="text-xl text-white mb-2">
              {t("about.promise.description1.text")} {" "}
              <span className="font-bold">{t("about.promise.description1.bold")}</span>{" "}
              {t("about.promise.description1.end")}
            </p>
            <p className="text-xl text-white mb-2">
              {t("about.promise.description2.text")} {" "}
              <span className="font-bold">
                {t("about.promise.description2.bold")}
              </span>
            </p>
            <div className="mt-8 flex items-center justify-center">
              <UserCheck className="text-white w-8 h-8 mr-2" />
              <span className="text-2xl font-bold text-white">
                {t("about.promise.noOneLeftBehind")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default function About() {
  return (
    <MainLayout>
      <AboutContent />
    </MainLayout>
  );
}
