/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Course } from "@/components/types";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { useAuth } from "@/components/contexts/AuthContext";
import { UserService } from "@/services/userService";
import { useParams } from "next/navigation";
import { CourseService } from "@/services/courseService";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Accordion from "@/components/ui/Accordion";
import VideoModal from "@/components/ui/VideoModal";
import LoginPrompt from "@/components/ui/LoginPrompt";
import {
  Play,
  BookOpen,
  Lock,
  Unlock,
  CheckCircle,
  Users,
  Clock,
  Award,
  Zap,
  Target,
} from "lucide-react";

export const runtime = "edge";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-lg font-semibold text-gray-700">{rating}/5</span>
    </div>
  );
};

const YouTubePlayer = ({ videoUrl }: { videoUrl: string }) => {
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Course Introduction Video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const userService = new UserService();
const courseService = new CourseService();

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { getById: getEnrolledCourse } = useEnrolledCourses();
  const [fetchedCourse, setFetchedCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [loginPromptOpen, setLoginPromptOpen] = useState<boolean>(false);
  const [loginRedirectUrl, setLoginRedirectUrl] = useState<string>("");

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoadingCourse(true);

        const res = await courseService.getCourseById(String(id));

        if (!ignore && res?.success && res?.data) {
          const course = res.data;

          const courseData = {
            ...course,
            instructor: (() => {
              if (
                typeof course.instructor === "object" &&
                course.instructor !== null &&
                typeof course.instructor.id === "string"
              ) {
                return {
                  ...course.instructor,
                  name:
                    typeof course.instructor.name === "string" &&
                    course.instructor.name
                      ? course.instructor.name
                      : "Unknown Instructor",
                };
              } else {
                return {
                  id: course.instructorId ?? "unknown",
                  name:
                    typeof course.instructor === "string" && course.instructor
                      ? course.instructor
                      : "Unknown Instructor",
                  firstName: "",
                  lastName: "",
                  avatar: null,
                  bio: "",
                };
              }
            })(),

            instructorId: course.instructorId ?? "",

            duration:
              typeof course.duration === "string"
                ? course.duration
                : String(course.duration ?? ""),

            category:
              typeof course.category === "object" &&
              course.category !== null &&
              "name" in course.category
                ? course.category.name
                : typeof course.category === "string"
                ? course.category
                : "General",

            createdAt: course.createdAt
              ? new Date(course.createdAt)
              : new Date(),

            sections: Array.isArray(course.sections)
              ? course.sections.map((sec) => ({
                  ...sec,
                  lessons: Array.isArray(sec.lessons) ? sec.lessons : [],
                }))
              : [],

            thumbnail: course.thumbnail ?? "",

            courseIntroVideo: course.courseIntroVideo ?? "",
          };
          setFetchedCourse(courseData);
        }
      } finally {
        if (!ignore) setLoadingCourse(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (authLoading || !fetchedCourse || !user) return;

    const enrolledCourse = getEnrolledCourse(String(id));

    if (enrolledCourse) {
      setIsEnrolled(true);
      router.push(`/dashboard/student/learn/${id}`);
    }
  }, [id, user, fetchedCourse, authLoading, getEnrolledCourse, router]);

  if (loadingCourse || authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading course details...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!fetchedCourse) {
    router.replace("/404");
    return null;
  }

  const handleLessonClick = (lesson: any, type: "video" | "resource") => {
    if (!user) {
      setLoginRedirectUrl(`/courses/${id}`);
      setLoginPromptOpen(true);
      return;
    }

    if (type === "video" && lesson.video) {
      setSelectedVideoUrl(lesson.video);
      setSelectedVideoTitle(lesson.title);
      setVideoModalOpen(true);
    } else if (type === "resource" && lesson.resource) {
      window.open(lesson.resource, "_blank");
    }
  };

  const {
    title,
    description,
    shortDescription,
    thumbnail,
    courseIntroVideo,
    price,
    discountPrice,
    discountPercentage,
    level,
    type,
    isPublished,
    isFeatured,
    duration,
    enrollmentCount,
    rating,
    reviewCount,
    total,
    createdAt,
    updatedAt,
    instructor,
    category,
    sections,
    tags,
    requirements,
    learningOutcomes,
  } = fetchedCourse as any;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* BREADCRUMB */}
        <div className="bg-white/40 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                href="/courses"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Courses
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-semibold truncate">
                {title}
              </span>
            </nav>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* LEFT COLUMN - Course Info */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Category & Title */}
                {/* Banner & Title Section */}
                <div className="rounded-3xl bg-white/80 shadow-lg border border-white/40 p-8 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-shrink-0 w-full md:w-64 h-40 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={title || "Course thumbnail"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200/50">
                          {category?.name || "Course"}
                        </span>
                        {isFeatured && (
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 text-sm font-semibold rounded-full border border-orange-200/50 flex items-center gap-1">
                            <Zap className="w-4 h-4" /> Featured
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {title}
                      </h1>
                      {shortDescription && (
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                          {shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Stats Row */}
                {/* Key Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Duration
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {duration} min
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Enrolled
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {enrollmentCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Level
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {level}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Content
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating & Reviews */}
                {/* Rating & Instructor */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                        Student Rating
                      </p>
                      <StarRating rating={Math.round(rating)} />
                      <p className="text-sm text-gray-500 mt-2">
                        Based on {reviewCount} reviews
                      </p>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-l border-gray-200 pt-6 sm:pt-0 sm:pl-6">
                      <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                        Instructor
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {instructor?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {/* Course Overview */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-500 pl-3 mb-2">
                    কোর্স পরিচিতি
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {description}
                  </p>
                </div>

                {/* Course Intro Video */}
                {courseIntroVideo && (
                  <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-purple-500 pl-3 mb-2">
                      কোর্স ইন্ট্রো ভিডিও
                    </h2>
                    <YouTubePlayer videoUrl={courseIntroVideo} />
                    <p className="text-sm text-gray-500 italic">
                      কোর্সের সংক্ষিপ্ত পরিচিতি ভিডিও
                    </p>
                  </section>
                )}
              </div>

              {/* RIGHT COLUMN - Pricing Card */}
              <div className="lg:col-span-1">
                <div
                  className="sticky top-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden transition-shadow flex flex-col"
                  style={{ minHeight: 420 }}
                >
                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    {/* Pricing */}
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        কোর্স ফি
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ৳{discountPrice || price}
                        </span>
                        {discountPrice && (
                          <span className="text-lg line-through text-gray-400">
                            ৳{price}
                          </span>
                        )}
                      </div>
                      {discountPrice && (
                        <p className="text-sm font-semibold text-green-600">
                          {discountPercentage}% ছাড়
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        একবার পেমেন্ট • ২ বছরের কন্টেন্ট অ্যাক্সেস
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      className="w-full font-semibold text-white rounded-xl py-3 hover:shadow-lg transition-all duration-300 text-base bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                      onClick={() => {
                        if (!user) {
                          router.push(`/login?next=/courses/${id}`);
                          return;
                        }
                        router.push(`/enroll?courseId=${id}`);
                      }}
                    >
                      কোর্সে ভর্তি হন
                    </Button>

                    {/* Course Includes */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <p className="font-bold text-gray-900 text-base mb-2">
                        এই কোর্সে যা যা পাচ্ছেন
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            {duration} মিনিটের রেকর্ডেড ভিডিও
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            ২ বছরের কন্টেন্ট অ্যাক্সেস
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            প্রফেশনাল সার্টিফিকেট
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            ২৪/৭ স্টুডেন্ট সাপোর্ট
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REQUIREMENTS & LEARNING OUTCOMES SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Requirements */}
            {Array.isArray(requirements) && requirements.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Requirements
                </h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 space-y-3">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{req}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Outcomes */}
            {Array.isArray(learningOutcomes) && learningOutcomes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Target className="w-6 h-6 text-green-600" />
                  What You'll Learn
                </h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 space-y-3">
                  {learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TAGS SECTION */}
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Skills You'll Gain
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER INFO */}
        <div className="bg-white/40 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Created
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Last Updated
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Course Type
                </p>
                <p className="font-semibold text-gray-900">{type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={selectedVideoUrl}
        title={selectedVideoTitle}
      />

      <LoginPrompt
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        redirectUrl={loginRedirectUrl}
      />
    </MainLayout>
  );
}
