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
            Failure Management – Turning Setbacks into Comebacks
          </h2>
          <p className="text-center text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            At Shekhabo, we know that failure happens and that's okay. Whether
            you don't pass an assessment, struggle with a topic, or fail to land
            a job, our team is here to put you back on track.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Map className="text-blue-600 w-8 h-8 mb-4" />
              <h3 className="text-xl text-black font-bold text-center mb-2">
                Personal Review
              </h3>
              <p className="text-base text-center text-gray-700">
                Our team analyzes your challenges with you to identify
                improvement areas.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Bolt className="text-pink-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Extra Support
              </h3>
              <p className="text-base text-center text-gray-700">
                We add short modules, targeted courses, or workshops to cover
                weak spots.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <TrendingUp className="text-green-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Custom Roadmap
              </h3>
              <p className="text-base text-center text-gray-700">
                Get a step-by-step recovery plan designed for your specific
                situation.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <UserCheck className="text-orange-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                1-to-1 Mentorship
              </h3>
              <p className="text-base text-center text-gray-700">
                Access personalized guidance from experts to rebuild confidence.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <BarChart3 className="text-violet-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Mindset & Motivation
              </h3>
              <p className="text-base text-center text-gray-700">
                We remind you:{" "}
                <span className="font-bold text-gray-900">
                  failure is feedback, not the end.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="industry-workshops-section py-16 px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-black mb-6">
            Industry-Specific Workshops
          </h2>
          <p className="text-center text-lg text-gray-700 mb-12 max-w-4xl mx-auto">
            Every industry has unique hiring practices and hidden requirements.
            Our workshops prepare you with insider knowledge, practical tests,
            and direct guidance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Building2 className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                Unilever Workshop
              </h3>
              <p className="text-gray-700 mb-4">
                How to pass FMCG case competitions, aptitude tests, and
                leadership rounds.
              </p>
              <span className="italic text-gray-500 text-sm">
                Live Sessions • University Seminars
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Bolt className="text-pink-800 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                BATB Workshop
              </h3>
              <p className="text-gray-700 mb-4">
                Insights from ex-employees on cracking MTO roles at British
                American Tobacco Bangladesh.
              </p>
              <span className="italic text-gray-500 text-sm">
                Webinars • Mini Bootcamps
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Banknote className="text-green-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                Banking & Finance Bootcamp
              </h3>
              <p className="text-gray-700 mb-4">
                Training on aptitude, group discussions, and mock interviews for
                banking sector.
              </p>
              <span className="italic text-gray-500 text-sm">
                Online Sessions • Mock Tests
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Laptop className="text-orange-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                IT Industry Prep
              </h3>
              <p className="text-gray-700 mb-4">
                Coding tests, portfolio reviews, and system design interviews
                for tech careers.
              </p>
              <span className="italic text-gray-500 text-sm">
                Live Coding • Portfolio Review
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col mb-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Ruler className="text-purple-500 w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                Engineering Career Pathways
              </h3>
              <p className="text-gray-700 mb-4">
                Guidance for Civil, Mechanical, Electrical & Architecture
                students.
              </p>
              <span className="italic text-gray-500 text-sm">
                Field-Specific Training
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose-us-section py-16 px-4 sm:px-10 lg:px-50 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-black mb-10">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Map className="text-blue-600 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Structured Roadmaps
              </h3>
              <p className="text-base text-center text-gray-700">
                Clear guidelines and step-by-step career planning.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Bolt className="text-pink-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Industry-Specific Hacks
              </h3>
              <p className="text-base text-center text-gray-700">
                Land jobs faster with insider knowledge and strategies.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <TrendingUp className="text-green-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Complete Career Journey
              </h3>
              <p className="text-base text-center text-gray-700">
                From applying → thriving in the role → switching jobs
                respectfully.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <UserCheck className="text-orange-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Prospect Manager Support
              </h3>
              <p className="text-base text-center text-gray-700">
                Personalized mentorship throughout your journey.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Factory className="text-violet-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Industry-Built Courses
              </h3>
              <p className="text-base text-center text-gray-700">
                Courses built{" "}
                <span className="font-bold">with industry, for industry.</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Users className="text-blue-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                No One Left Behind
              </h3>
              <p className="text-base text-center text-gray-700">
                Our step-by-step guidance ensures every learner understands
                before moving on, building confidence with each step.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="industries-career-section py-16 px-4 sm:px-10 lg:px-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-black mb-10">
            Industries & Career Paths We Cover
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <GraduationCap className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                BCS Preparation
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Building2 className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Multinational Companies
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Banknote className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                MTO & Banking
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Phone className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                BPO Job Preparation
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Laptop className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                IT & Software
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Ruler className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Engineering
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <BarChart3 className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Career Guidelines
              </h3>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Factory className="text-indigo-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold text-black text-center mb-2">
                Industry Workshops
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
              The Shekhabo Promise
            </h2>
            <p className="text-xl text-white mb-2">
              We don't just train you; we{" "}
              <span className="font-bold">walk with you</span> until you
              succeed.
            </p>
            <p className="text-xl text-white mb-2">
              With expert instructors, personalized support, and a proven
              structure, Shekhabo.com is where your{" "}
              <span className="font-bold">
                learning truly turns into earning.
              </span>
            </p>
            <div className="mt-8 flex items-center justify-center">
              <UserCheck className="text-white w-8 h-8 mr-2" />
              <span className="text-2xl font-bold text-white">
                No learner is left behind.
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
