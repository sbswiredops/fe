/* eslint-disable @next/next/no-img-element */
"use client";

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
} from "lucide-react";

export const runtime = "edge";

// Animated counter hook
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

  // Ensure rating is a valid number
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            <Star
              className={`${sizes[size]} text-gray-200`}
              fill="currentColor"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: `${Math.min(100, Math.max(0, (numericRating - star + 1) * 100))}%`,
              }}
            >
              <Star
                className={`${sizes[size]} text-yellow-400 drop-shadow-sm`}
                fill="currentColor"
              />
            </div>
          </div>
        ))}
      </div>
      <span className="text-lg font-bold text-gray-800">
        {numericRating.toFixed(1)}
      </span>
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
      <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">{invalidLabel}</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative group">
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
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play
                className="w-8 h-8 text-blue-600 ml-1"
                fill="currentColor"
              />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
            ▶ {watchLabel}
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

// Floating CTA for mobile
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
            ৳{discountPrice || price}
          </span>
          {discountPrice && (
            <span className="text-sm line-through text-gray-400 ml-2">
              ৳{price}
            </span>
          )}
        </div>
        <Button
          size="lg"
          className="flex-1 max-w-[200px] font-semibold text-white rounded-xl py-3 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
          onClick={onClick}
        >
          {enrollLabel}
        </Button>
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({
  icon: Icon,
  title,
  color = "blue",
}: {
  icon: any;
  title: string;
  color?: string;
}) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} shadow-lg`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
};

const userService = new UserService();
const courseService = new CourseService();

// Curriculum Section Component with accordion
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
        className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            {sIdx + 1}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {section.title || `${labels.module} ${sIdx + 1}`}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {lessonCount} {labels.lessons}{" "}
              {quizCount > 0 && `• ${quizCount} ${labels.quiz}`}{" "}
              {totalDuration > 0 && `• ${totalDuration} ${labels.min}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {section.isFinalSection && (
            <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 font-semibold">
              {labels.final}
            </span>
          )}
          <div
            className={`p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-all duration-300 ${isExpanded ? "rotate-180" : ""}`}
          >
            <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </div>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        {/* Lessons */}
        {Array.isArray(section.lessons) && section.lessons.length > 0 && (
          <ul className="divide-y divide-gray-50 bg-white">
            {section.lessons.map((lesson: any, lIdx: number) => (
              <li
                key={lesson.id ?? `lesson-${sIdx}-${lIdx}`}
                className="flex items-center px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group/lesson"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${lesson.video ? "bg-blue-100" : "bg-purple-100"}`}
                  >
                    {lesson.video ? (
                      <PlayCircle className="w-4 h-4 text-blue-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-800 group-hover/lesson:text-blue-600 transition-colors">
                    {lesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.duration && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {lesson.duration} {labels.min}
                    </span>
                  )}
                  {lesson.isFree ? (
                    <span className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> {labels.free}
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Quizzes */}
        {Array.isArray(section.quizzes) && section.quizzes.length > 0 && (
          <ul className="divide-y divide-gray-50 bg-purple-50/30">
            {section.quizzes.map((quiz: any, qIdx: number) => (
              <li
                key={quiz.id ?? `quiz-${sIdx}-${qIdx}`}
                className="flex items-center px-6 py-4 hover:bg-purple-100/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">
                      {quiz.title}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {quiz.totalQuestions} {labels.questions} •{" "}
                      {quiz.totalMarks} {labels.marks}• {quiz.totalTime}{" "}
                      {labels.min}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {quiz.isFinalQuiz && (
                    <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                      {labels.final}
                    </span>
                  )}
                  {quiz.isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
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

  const handleEnrollClick = () => {
    if (!user) {
      router.push(`/login?next=/courses/${id}`);
      return;
    }
    router.push(`/enroll?courseId=${id}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50">
        {/* BREADCRUMB */}
        <div className="bg-white/60 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                  {t("courseDetails.breadcrumb.home")}
                </Link>
                <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                <Link
                  href="/courses"
                  className="text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                  {t("courseDetails.breadcrumb.courses")}
                </Link>
                <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                <span className="text-gray-900 font-semibold truncate max-w-[200px]">
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2 rounded-full transition-all duration-300 ${isWishlisted ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
                <button className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-300">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute top-60 -left-20 w-60 h-60 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
              {/* LEFT COLUMN - Course Info */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Hero Card */}
                <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  {/* Thumbnail with overlay */}
                  <div className="relative h-48 sm:h-64 lg:h-72">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={title || "Course thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Badges on thumbnail */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-sm font-semibold rounded-full shadow-lg">
                        {category?.name || "Course"}
                      </span>
                      {isFeatured && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />{" "}
                          {t("courseDetails.featured")}
                        </span>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                        {title}
                      </h1>
                    </div>
                  </div>

                  {/* Course meta info */}
                  <div className="p-6">
                    {shortDescription && (
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {shortDescription}
                      </p>
                    )}

                    {/* Instructor & Rating row */}
                    <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {instructor?.name?.charAt(0) || "I"}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {t("courseDetails.meta.instructor")}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {instructor?.name}
                          </p>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-gray-200 hidden sm:block" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {t("courseDetails.meta.rating")}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={rating || 0} size="sm" />
                          <span className="text-sm text-gray-500">
                            ({reviewCount} {t("courseDetails.meta.reviews")})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 group hover:from-blue-100 hover:to-blue-200/50 transition-all duration-300">
                        <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold text-gray-900">
                          {duration}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t("courseDetails.stats.minutes")}
                        </p>
                      </div>
                      <div
                        ref={enrollmentCounter.ref}
                        className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 group hover:from-purple-100 hover:to-purple-200/50 transition-all duration-300"
                      >
                        <Users className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold text-gray-900">
                          {enrollmentCounter.count}+
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t("courseDetails.stats.students")}
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 group hover:from-orange-100 hover:to-orange-200/50 transition-all duration-300">
                        <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold text-gray-900 capitalize">
                          {level}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t("courseDetails.stats.level")}
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 group hover:from-green-100 hover:to-green-200/50 transition-all duration-300">
                        <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-2xl font-bold text-gray-900">
                          {sections?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {t("courseDetails.stats.modules")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Overview Section */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                  <SectionHeader
                    icon={BookOpen}
                    title={t("courseDetails.sections.courseIntro")}
                    color="blue"
                  />
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Course Intro Video */}
                {courseIntroVideo && (
                  <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <SectionHeader
                      icon={PlayCircle}
                      title={t("courseDetails.sections.introVideo")}
                      color="purple"
                    />
                    <YouTubePlayer
                      videoUrl={courseIntroVideo}
                      watchLabel={t("courseDetails.video.watchVideo")}
                      invalidLabel={t("courseDetails.video.invalidUrl")}
                    />
                  </div>
                )}

                {/* Course Curriculum Section */}
                {Array.isArray(sections) && sections.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 pb-4">
                      <SectionHeader
                        icon={GraduationCap}
                        title={t("courseDetails.sections.curriculum")}
                        color="blue"
                      />
                      <p className="text-gray-500 -mt-4">
                        {sections.length} {t("courseDetails.stats.modules")} •{" "}
                        {sections.reduce(
                          (acc: number, s: any) =>
                            acc + (s.lessons?.length || 0),
                          0,
                        )}{" "}
                        {t("courseDetails.curriculum.lessons")}
                      </p>
                    </div>
                    <div className="border-t border-gray-100">
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
                )}
              </div>

              {/* RIGHT COLUMN - Pricing Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  {/* Main Pricing Card */}
                  <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
                    {/* Discount banner */}
                    {discountPrice && (
                      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-red-500 text-white text-center py-2.5 px-4 relative overflow-hidden">
                        <p className="font-bold text-sm relative z-10">
                          🔥 {discountPercentage}%{" "}
                          {t("courseDetails.pricing.discountRunning")}
                        </p>
                      </div>
                    )}

                    <div className="p-6 space-y-6">
                      {/* Price */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          {t("courseDetails.pricing.courseFee")}
                        </p>
                        <div className="flex items-baseline justify-center gap-3">
                          <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                            ৳{discountPrice || price}
                          </span>
                          {discountPrice && (
                            <span className="text-xl line-through text-gray-400 font-medium">
                              ৳{price}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {t("courseDetails.pricing.oneTimePayment")} •{" "}
                          {t("courseDetails.pricing.lifetimeAccess")}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <Button
                        size="lg"
                        className="w-full font-bold text-white rounded-2xl py-4 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        onClick={handleEnrollClick}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {t("courseDetails.cta.enrollNow")}
                      </Button>

                      {/* Trust badges */}
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>
                            {t("courseDetails.pricing.securePayment")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>
                            {t("courseDetails.pricing.moneyBackGuarantee")}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-4 text-sm text-gray-500">
                            {t("courseDetails.pricing.whatYouGet")}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <PlayCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {duration}{" "}
                              {t("courseDetails.features.videoMinutes")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("courseDetails.features.hdQuality")}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Globe className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {t("courseDetails.features.lifetimeAccess")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("courseDetails.features.anyDevice")}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {t("courseDetails.features.certificate")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("courseDetails.features.afterCompletion")}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                            <Headphones className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {t("courseDetails.features.support")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("courseDetails.features.anyIssue")}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Social Proof Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={`avatar-${i}`}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {enrollmentCount}+{" "}
                          {t("courseDetails.socialProof.studentsEnrolled")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("courseDetails.socialProof.inThisCourse")}
                        </p>
                      </div>
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
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                <SectionHeader
                  icon={BookOpen}
                  title={t("courseDetails.sections.requirements")}
                  color="blue"
                />
                <ul className="space-y-4">
                  {requirements.map((req: string, idx: number) => (
                    <li key={req ?? `req-${idx}`} className="flex gap-4 items-start group">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-200 transition-colors">
                        <span className="text-blue-600 text-sm font-bold">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-gray-700">{req}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {Array.isArray(learningOutcomes) && learningOutcomes.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                <SectionHeader
                  icon={Target}
                  title={t("courseDetails.sections.learningOutcomes")}
                  color="green"
                />
                <ul className="space-y-4">
                  {learningOutcomes.map((outcome: string, idx: number) => (
                    <li key={outcome ?? `outcome-${idx}`} className="flex gap-4 items-start group">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-gray-700">{outcome}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* TAGS SECTION */}
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
              <SectionHeader
                icon={Sparkles}
                title={t("courseDetails.sections.skills")}
                color="purple"
              />
              <div className="flex flex-wrap gap-3">
                {tags.map((tag: string, idx: number) => (
                  <span
                    key={tag ?? `tag-${idx}`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:border-blue-300 hover:from-blue-100 hover:to-purple-100 transition-all cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER INFO */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  {t("courseDetails.meta.created")}
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(createdAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  {t("courseDetails.meta.updated")}
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(updatedAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  {t("courseDetails.meta.type")}
                </p>
                <p className="font-semibold text-gray-900 capitalize">{type}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  {t("courseDetails.meta.language")}
                </p>
                <p className="font-semibold text-gray-900">
                  {t("courseDetails.meta.bangla")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA for Mobile */}
      <FloatingCTA
        price={price}
        discountPrice={discountPrice}
        onClick={handleEnrollClick}
        enrollLabel={t("courseDetails.cta.enroll")}
      />

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
