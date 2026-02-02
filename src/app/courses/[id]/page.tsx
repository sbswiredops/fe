/* eslint-disable @next/next/no-img-element */
"use client";

export const runtime = "edge";

import React, { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Sparkles,
  GraduationCap,
  PlayCircle,
  FileText,
  TrendingUp,
  Heart,
  Share2,
  Calendar,
  Globe,
  Headphones,
  BarChart3,
  Medal,
} from "lucide-react";

const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, ref };
};

const StarRating = ({
  rating,
  size = "md",
}: {
  rating: number | string | null | undefined;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const numericRating = Number(rating) || 0;

  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            <Star
              className={`${sizes[size]} text-gray-300`}
              fill="currentColor"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: `${Math.min(100, Math.max(0, (numericRating - star + 1) * 100))}%`,
              }}
            >
              <Star
                className={`${sizes[size]} text-yellow-400`}
                fill="currentColor"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const YouTubePlayer = ({
  videoUrl,
  watchLabel,
  invalidLabel,
}: {
  videoUrl: string;
  watchLabel: string;
  invalidLabel: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">{invalidLabel}</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg relative group">
      {!isPlaying ? (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Play
                className="w-6 h-6 text-blue-600 ml-0.5"
                fill="currentColor"
              />
            </div>
          </div>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Course Introduction Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

const FloatingCTA = ({
  price,
  discountPrice,
  onClick,
  enrollLabel,
}: {
  price: number;
  discountPrice?: number;
  onClick: () => void;
  enrollLabel: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 z-50 lg:hidden transform transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            ৳
            {discountPrice && price && discountPrice < price
              ? discountPrice
              : price}
          </span>
          {discountPrice && price && discountPrice < price && (
            <span className="text-sm line-through text-gray-400 ml-2">
              ৳{price}
            </span>
          )}
        </div>
        <Button
          size="lg"
          className="flex-1 max-w-[200px] font-semibold text-white rounded-lg py-3 bg-blue-600 hover:bg-blue-700"
          onClick={onClick}
        >
          {enrollLabel}
        </Button>
      </div>
    </div>
  );
};

const CurriculumSection = ({
  section,
  sIdx,
  isExpanded,
  onToggle,
  labels,
}: {
  section: any;
  sIdx: number;
  isExpanded: boolean;
  onToggle: () => void;
  labels: {
    lessons: string;
    quiz: string;
    min: string;
    free: string;
    final: string;
    module: string;
    questions: string;
    marks: string;
  };
}) => {
  const lessonCount = section.lessons?.length || 0;
  const quizCount = section.quizzes?.length || 0;
  const totalDuration =
    section.lessons?.reduce(
      (acc: number, l: any) => acc + (l.duration || 0),
      0,
    ) || 0;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-blue-50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            {sIdx + 1}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-base">
              {section.title || `${labels.module} ${sIdx + 1}`}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {lessonCount} {labels.lessons}
              {quizCount > 0 && ` • ${quizCount} ${labels.quiz}`}
              {totalDuration > 0 && ` • ${totalDuration} ${labels.min}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {section.isFinalSection && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
              {labels.final}
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        {Array.isArray(section.lessons) && section.lessons.length > 0 && (
          <ul className="divide-y divide-gray-50 bg-white">
            {section.lessons.map((lesson: any, lIdx: number) => (
              <li
                key={lesson.id ?? `lesson-${sIdx}-${lIdx}`}
                className="flex items-center px-6 py-3 hover:bg-blue-50/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-sm ${lesson.video ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}
                  >
                    {lesson.video ? (
                      <PlayCircle className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {lesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.duration && (
                    <span className="text-xs text-gray-500">
                      {lesson.duration} min
                    </span>
                  )}
                  {lesson.isFree ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Free
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {Array.isArray(section.quizzes) && section.quizzes.length > 0 && (
          <ul className="divide-y divide-gray-50 bg-purple-50/30">
            {section.quizzes.map((quiz: any, qIdx: number) => (
              <li
                key={quiz.id ?? `quiz-${sIdx}-${qIdx}`}
                className="flex items-center px-6 py-3 hover:bg-purple-100/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 text-sm">
                      {quiz.title}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {quiz.totalQuestions} {labels.questions} •{" "}
                      {quiz.totalMarks} {labels.marks} • {quiz.totalTime}{" "}
                      {labels.min}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {quiz.isFinalQuiz && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                      Final
                    </span>
                  )}
                  {quiz.isLocked ? (
                    <Lock className="w-4 h-4 text-gray-300" />
                  ) : (
                    <Unlock className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const userService = new UserService();
const courseService = new CourseService();

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const { getById: getEnrolledCourse } = useEnrolledCourses();
  const [fetchedCourse, setFetchedCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [loginPromptOpen, setLoginPromptOpen] = useState<boolean>(false);
  const [loginRedirectUrl, setLoginRedirectUrl] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0]),
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const enrollmentCounter = useCounter(
    Number(fetchedCourse?.enrollmentCount) || 0,
  );

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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              {t("courseDetails.loading")}
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

  const handleEnrollClick = () => {
    if (!user) {
      router.push(`/login?next=/courses/${id}`);
      return;
    }
    router.push(`/enroll?courseId=${id}`);
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
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
      <div className="min-h-screen bg-white">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">
              {/* MAIN CONTENT */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title & Badges */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {category && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                        {category.name || "Course"}
                      </span>
                    )}
                    {isFeatured && (
                      <span className=" px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Featured
                      </span>
                    )}
                    {level && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full  tracking-wide capitalize">
                        {level}
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h1>
                </div>

                {/* Course Intro Video */}
                {courseIntroVideo && (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <YouTubePlayer
                      videoUrl={courseIntroVideo}
                      watchLabel="Watch"
                      invalidLabel="Invalid video URL"
                    />
                  </div>
                )}
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  About this course
                </h2>
                {shortDescription && (
                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                    {shortDescription}
                  </p>
                )}

                {/* Teacher / Minutes / Modules Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200 items-start">
                  {/* Teacher */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {instructor?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Instructor</p>
                      <p className="text-md font-bold text-gray-900">
                        {instructor?.name || "Unknown Instructor"}
                      </p>
                      {instructor?.bio && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="space-y-1 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-green-500">
                      {duration}
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("courseDetails.curriculum.min")}
                    </p>
                  </div>

                  {/* Modules */}
                  <div className="space-y-1 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {sections?.length || 0}
                    </div>
                    <p className="text-sm text-gray-600">Modules</p>
                  </div>
                </div>
              </div>

              {/* SIDEBAR - Pricing */}
              <div className="lg:col-span-1 sticky top-24 space-y-6">
                {/* Pricing Card (with Thumbnail on top) */}
                <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                  {thumbnail && (
                    <div className="w-full h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-5">
                    {discountPrice && price && discountPrice < price && (
                      <div className="bg-red-100 border border-red-200 text-red-800 text-sm font-bold py-2 px-3 rounded-lg text-center">
                        🔥 {discountPercentage}% OFF
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                        Course Price
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-blue-600">
                          ৳
                          {discountPrice && price && discountPrice < price
                            ? discountPrice
                            : price}
                        </span>
                        {discountPrice && price && discountPrice < price && (
                          <span className="text-lg line-through text-gray-400">
                            ৳{price}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        One-time payment • Lifetime access
                      </p>
                    </div>

                    <Button
                      onClick={handleEnrollClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                    >
                      <Zap className="w-4 h-4 mr-2 inline" />
                      Enroll Now
                    </Button>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Secure payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span>30-day money back</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-5 space-y-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                        What you get
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <PlayCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {duration} minutes
                            </p>
                            <p className="text-xs text-gray-500">
                              HD quality video
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Lifetime Access
                            </p>
                            <p className="text-xs text-gray-500">
                              Learn at your pace
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Award className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Certificate
                            </p>
                            <p className="text-xs text-gray-500">
                              Upon completion
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Headphones className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Support
                            </p>
                            <p className="text-xs text-gray-500">24/7 help</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Curriculum section below */}
        {Array.isArray(sections) && sections.length > 0 && (
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Course Curriculum
                  </h2>
                  <p className="text-gray-600">
                    {sections.length} modules •{" "}
                    {sections.reduce(
                      (acc: number, s: any) => acc + (s.lessons?.length || 0),
                      0,
                    )}{" "}
                    lessons
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden ">
                  {sections.map((section: any, sIdx: number) => (
                    <CurriculumSection
                      key={section.id ?? `section-${sIdx}`}
                      section={section}
                      sIdx={sIdx}
                      isExpanded={expandedSections.has(sIdx)}
                      onToggle={() => toggleSection(sIdx)}
                      labels={{
                        lessons: t("courseDetails.curriculum.lessons"),
                        quiz: t("courseDetails.curriculum.quiz"),
                        min: t("courseDetails.curriculum.min"),
                        free: t("courseDetails.curriculum.free"),
                        final: t("courseDetails.curriculum.final"),
                        module: t("courseDetails.curriculum.module"),
                        questions: t("courseDetails.curriculum.questions"),
                        marks: t("courseDetails.curriculum.marks"),
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LEARNING OUTCOMES SECTION - What you'll learn */}
        {learningOutcomes?.length > 0 && (
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t("courseDetails.whatYouWillLearn") || "কী কী শিখবেন এ কোর্স থেকে?"}
              </h2>
              <p className="text-gray-600 mb-10">
                Master essential skills with our comprehensive curriculum
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningOutcomes.map((outcome: string, idx: number) => (
                  <div
                    key={outcome ?? `outcome-${idx}`}
                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <p className="text-gray-800 font-medium">{outcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REQUIREMENTS & PREREQUISITES SECTION */}
        {(requirements?.length > 0 || learningOutcomes?.length > 0) && (
          <section className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="grid md:grid-cols-2 gap-12">
                {requirements?.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t("courseDetails.requirements") || "Prerequisites"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      What you should know before starting
                    </p>
                    <ul className="space-y-3">
                      {requirements.map((req: string, idx: number) => (
                        <li
                          key={req ?? `req-${idx}`}
                          className="flex gap-3 items-start p-3 bg-white rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {learningOutcomes?.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t("courseDetails.benefits") || "Benefits You'll Gain"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Advantages of taking this course
                    </p>
                    <ul className="space-y-3">
                      <li className="flex gap-3 items-start p-3 bg-white rounded-lg">
                        <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Professional Certificate</p>
                          <p className="text-sm text-gray-600">Upon completion</p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start p-3 bg-white rounded-lg">
                        <GraduationCap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Lifetime Access</p>
                          <p className="text-sm text-gray-600">Learn at your pace</p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start p-3 bg-white rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Career Growth</p>
                          <p className="text-sm text-gray-600">Industry-expert content</p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start p-3 bg-white rounded-lg">
                        <Headphones className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">24/7 Support</p>
                          <p className="text-sm text-gray-600">Always here to help</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SKILLS/TAGS */}
        {tags?.length > 0 && (
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("courseDetails.skillsYouWillMaster") || "Skills you'll master"}
              </h3>
              <p className="text-gray-600 mb-8">
                Practical skills applicable to your career
              </p>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag: string, idx: number) => (
                  <span
                    key={tag ?? `tag-${idx}`}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COURSE GOALS / CAREER PATHS SECTION */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("courseDetails.courseGoals") || "কোর্সটি যে উদ্দেশ্যে করবেন"}
            </h2>
            <p className="text-gray-600 mb-10">
              Explore potential career paths and goals after completion
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Professional Development", icon: TrendingUp, desc: "Advance your skills and expertise" },
                { title: "Freelancing", icon: Globe, desc: "Start or expand freelance career" },
                { title: "Career Switch", icon: Target, desc: "Move into a new industry" },
                { title: "Business Growth", icon: BarChart3, desc: "Boost your business presence" },
              ].map((goal, idx) => {
                const Icon = goal.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* COURSE HIGHLIGHTS / KEY STATS */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              {t("courseDetails.courseHighlights") || "এই কোর্সের ভেতরে যা যা রয়েছে"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">{duration}+</div>
                <p className="text-sm text-gray-600">
                  {t("courseDetails.minutesOfContent") || "Hours of Content"}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">{sections?.length || 0}+</div>
                <p className="text-sm text-gray-600">
                  {t("courseDetails.modules") || "Modules"}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {sections?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0}+
                </div>
                <p className="text-sm text-gray-600">
                  {t("courseDetails.quizzes") || "Quizzes"}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
                <p className="text-sm text-gray-600">
                  {t("courseDetails.lifetimeAccess") || "Lifetime Access"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

        {/* INSTRUCTOR SECTION */}
        {instructor && (
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-10">
                {t("courseDetails.instructor") || "আপনি যার কাছ থেকে শিখবেন"}
              </h2>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {instructor.name?.charAt(0) || "?"}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {instructor.name || "Unknown Instructor"}
                  </h3>
                  <p className="text-sm text-blue-600 font-semibold mb-4">
                    Course Instructor at Shekhabo
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {instructor.bio ||
                      "Expert instructor with years of experience in the field. Committed to delivering high-quality education and mentoring students to achieve their career goals."}
                  </p>
                  <div className="mt-6 flex gap-4">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{enrollmentCount || 0}+</p>
                      <p className="text-sm text-gray-600">Students taught</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{rating || 4.8}</p>
                      <div className="flex items-center gap-1">
                        <StarRating rating={rating} size="sm" />
                        <p className="text-sm text-gray-600">({reviewCount || 0} reviews)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS/REVIEWS SECTION */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("courseDetails.testimonials") || "বহুব্রীহির শিক্ষার্থীরা যা বলছেন"}
            </h2>
            <p className="text-gray-600 mb-10">
              See what our students have to say about this course
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Student Name",
                  role: "Student",
                  avatar: "S",
                  rating: 5,
                  text: "This course exceeded my expectations! The instructor explained everything clearly and the curriculum is comprehensive. Highly recommended!",
                },
                {
                  name: "Professional",
                  role: "Working Professional",
                  avatar: "P",
                  rating: 5,
                  text: "Great investment for my career. The practical assignments and real-world examples made all the difference. I'm already using these skills at work!",
                },
                {
                  name: "Freelancer",
                  role: "Freelancer",
                  avatar: "F",
                  rating: 4.8,
                  text: "Fantastic course! The lifetime access and certificate are great perks. I've already landed new projects thanks to what I learned here.",
                },
              ].map((review, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <StarRating rating={review.rating} size="md" />
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="text-xs text-gray-600">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("courseDetails.faq") || "সচরাচর প্রশ্নগুলোর উত্তর"}
            </h2>
            <p className="text-gray-600 mb-10">
              Common questions about this course
            </p>
            <div className="space-y-4">
              {[
                {
                  q: "Do I get lifetime access to the course?",
                  a: "Yes! Once you enroll, you have lifetime access to all the course materials, including any future updates.",
                },
                {
                  q: "Will I get a certificate after completion?",
                  a: "Absolutely! Upon completing the course and passing the final quiz, you'll receive a professional certificate that you can add to your resume.",
                },
                {
                  q: "Is this course suitable for beginners?",
                  a: "Yes! This course is designed for learners at all levels. We start with the basics and progress to advanced topics.",
                },
                {
                  q: "How long will it take to complete the course?",
                  a: "The course duration depends on your pace. Most students complete it within the suggested timeframe, but you can learn at your own speed.",
                },
                {
                  q: "Is there any support available during the course?",
                  a: "Yes! We provide 24/7 support through our help desk. You can reach out with any questions or concerns.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="p-6 bg-white border border-gray-200 rounded-lg group cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <summary className="flex items-center justify-between font-semibold text-gray-900 group-open:text-blue-600 transition-colors">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      <FloatingCTA
        price={price}
        discountPrice={discountPrice}
        onClick={handleEnrollClick}
        enrollLabel="Enroll"
      />

      {/* MODALS */}
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
