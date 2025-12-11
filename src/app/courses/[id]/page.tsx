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
import { Play, BookOpen, Lock, Unlock } from "lucide-react";

export const runtime = "edge";

const StarRating = ({ rating }: { rating: number }) => {
  return (
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
      <span className="text-lg text-gray-600 ml-2">{rating}</span>
    </div>
  );
};

// YouTube Video Player Component
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
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video lg:max-w-md lg:mx-auto bg-black rounded-lg overflow-hidden">
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
                // Ensure name is always a string (not undefined)
                return {
                  ...course.instructor,
                  name:
                    typeof course.instructor.name === "string" &&
                    course.instructor.name
                      ? course.instructor.name
                      : "Unknown Instructor",
                };
              } else {
                // Provide all required Instructor fields with safe defaults
                return {
                  id: course.instructorId ?? "unknown",
                  name: typeof course.instructor === "string" && course.instructor
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

            thumbnail: course.thumbnail ?? "", // Ensure thumbnail is always a string

            courseIntroVideo: course.courseIntroVideo ?? "", // Ensure courseIntroVideo is always a string
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

  // Check enrollment and redirect if enrolled
  useEffect(() => {
    if (authLoading || !fetchedCourse || !user) return;

    const enrolledCourse = getEnrolledCourse(String(id));

    if (enrolledCourse) {
      setIsEnrolled(true);
      router.push(`/dashboard/student/learn/${id}`);
    }
  }, [id, user, fetchedCourse, authLoading, getEnrolledCourse, router]);

  if (loadingCourse || authLoading) {
    return <div>Loading...</div>;
  }

  if (!fetchedCourse) {
    router.replace("/404");
    return null;
  }

  // Handle lesson click (video or resource)
  const handleLessonClick = (lesson: any, type: "video" | "resource") => {
    if (!user) {
      // Not logged in - show login prompt
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
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-blue-600">
                  Home
                </Link>
                <span>/</span>
                <Link href="/courses" className="hover:text-blue-600">
                  Courses
                </Link>
                <span>/</span>
                <span className="text-gray-900">{title}</span>
              </div>
            </nav>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  {/* Category */}
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                    {category?.icon} {category?.name}
                    {category?.isActive === false && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 rounded">
                        Inactive
                      </span>
                    )}
                  </span>
                  {/* Title */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                  {/* Short Description */}
                  {shortDescription && (
                    <p className="text-base text-gray-500 mb-2">
                      {shortDescription}
                    </p>
                  )}
                  {/* Description */}
                  <p className="text-xl text-gray-600 mb-4">{description}</p>
                  {/* Level, Type, Featured, Published */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {type}
                    </span>
                    {isFeatured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        Featured
                      </span>
                    )}
                    {isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        Unpublished
                      </span>
                    )}
                  </div>
                  {/* Price & Discount */}
                  <div className="mb-2">
                    {discountPrice ? (
                      <>
                        <span className="line-through text-gray-400">
                          ৳{price}
                        </span>
                        <span className="text-red-600 ml-2 font-bold">
                          ৳{discountPrice}
                        </span>
                        <span className="ml-2 text-green-600">
                          ({discountPercentage}% off)
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-blue-600">৳{price}</span>
                    )}
                  </div>
                  {/* Review Count & Total Content */}
                  <div className="mb-2 flex gap-8">
                    <span>
                      <span className="font-semibold text-gray-800">
                        Rating:
                      </span>{" "}
                      <span className="text-yellow-500">{rating}</span>
                      <span className="ml-2 text-gray-500 text-xs">
                        ({reviewCount} reviews)
                      </span>
                    </span>
                    <span>
                      <span className="font-semibold text-gray-800">
                        Total Content:
                      </span>{" "}
                      <span className="text-gray-700">{total}</span>
                    </span>
                  </div>
                  {/* Created/Updated Dates */}
                  <div className="mb-2 text-xs text-gray-400">
                    Created: {new Date(createdAt).toLocaleDateString()} |
                    Updated: {new Date(updatedAt).toLocaleDateString()}
                  </div>
                  {/* Category Description */}
                  {category?.description && (
                    <div className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Category Info:</span>{" "}
                      {category.description}
                    </div>
                  )}
                </div>

                {/* Course Intro Video Section */}
                {courseIntroVideo && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Course Introduction
                    </h2>
                    <YouTubePlayer videoUrl={courseIntroVideo} />
                    <p className="text-gray-600 mt-2 text-sm">
                      Watch this introduction to get an overview of what you'll
                      learn in this course.
                    </p>
                  </section>
                )}

                {/* Course Instructor Section */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Course instructor
                  </h3>
                  <div className="border rounded-lg p-4 flex items-center space-x-4 bg-white">
                    {fetchedCourse?.instructor?.avatar ? (
                      <img
                        src={fetchedCourse.instructor.avatar}
                        alt={fetchedCourse.instructor.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center text-gray-700 font-bold text-xl">
                        {fetchedCourse?.instructor?.name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-lg text-gray-900 flex items-center">
                        {fetchedCourse?.instructor?.name}
                        {/* Optional: Add a link to instructor profile */}
                        {/* <Link href={`/instructor/${fetchedCourse?.instructor?.id}`} className="ml-2 text-blue-600 hover:underline">&gt;</Link> */}
                      </div>
                      <div className="text-gray-700 text-sm mt-1">
                        {fetchedCourse?.instructor?.bio}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Content preview
                  </h2>
                  <Accordion
                    items={sections.map((section: any) => ({
                      id: section.id,
                      title: section.title,
                      content: (
                        <div className="space-y-3">
                          {/* Lessons */}
                          {section.lessons && section.lessons.length > 0 ? (
                            section.lessons.map((lesson: any) => {
                              const canAccess = user && lesson.isFree;
                              const isLocked = !lesson.isFree && !isEnrolled;

                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-start space-x-3 py-3 hover:bg-white transition-colors rounded px-2"
                                >
                                  <div className="flex-shrink-0 pt-1">
                                    {lesson.video ? (
                                      <Play className="w-5 h-5 text-gray-500 fill-gray-500" />
                                    ) : (
                                      <BookOpen className="w-5 h-5 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <h4 className="font-medium text-gray-900">
                                      {lesson.title}
                                    </h4>
                                    {lesson.content && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {lesson.content}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex-shrink-0 flex items-center space-x-2">
                                    {/* Action Button */}
                                    {lesson.video && (
                                      <button
                                        onClick={() =>
                                          handleLessonClick(lesson, "video")
                                        }
                                        disabled={isLocked}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                          isLocked
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        }`}
                                      >
                                        Play
                                      </button>
                                    )}
                                    {lesson.resource && (
                                      <button
                                        onClick={() =>
                                          handleLessonClick(lesson, "resource")
                                        }
                                        disabled={isLocked}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                          isLocked
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-green-50 text-green-600 hover:bg-green-100"
                                        }`}
                                      >
                                        Open
                                      </button>
                                    )}

                                    {/* Lock/Unlock Icon */}
                                    {isLocked ? (
                                      <Lock className="w-5 h-5 text-gray-400" />
                                    ) : lesson.isFree ? (
                                      <Unlock className="w-5 h-5 text-green-500" />
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-gray-600 py-3">
                              No lessons available in this section.
                            </p>
                          )}

                          {/* Quizzes */}
                          {section.quizzes && section.quizzes.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h5 className="font-semibold text-gray-800">
                                Quizzes:
                              </h5>
                              {section.quizzes.map((quiz: any) => (
                                <div
                                  key={quiz.id}
                                  className="flex items-center space-x-3 py-2 px-2 bg-gray-50 rounded"
                                >
                                  <span className="font-medium text-gray-900">
                                    {quiz.title}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {quiz.totalQuestions} Questions,{" "}
                                    {quiz.totalMarks} Marks
                                  </span>
                                  {quiz.isLocked ? (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <Unlock className="w-4 h-4 text-green-500" />
                                  )}
                                  {/* Quiz Button */}
                                  <button
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      quiz.isLocked
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                    }`}
                                    disabled={quiz.isLocked}
                                    onClick={() => {
                                      // Quiz click handler, e.g. open quiz modal or redirect
                                      if (!quiz.isLocked) {
                                        // Example: router.push(`/quiz/${quiz.id}`)
                                      }
                                    }}
                                  >
                                    Start Quiz
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </section>

                <section className="mt-8">
                  <div className="flex flex-wrap gap-8 mb-2">
                    <div>
                      <span className="font-semibold text-gray-800">
                        Enrollment:
                      </span>{" "}
                      <span className="text-gray-700">{enrollmentCount}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">
                        Rating:
                      </span>{" "}
                      <span className="text-yellow-500">{rating}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-800">Tags:</span>{" "}
                    <span className="text-gray-700">
                      {Array.isArray(tags) ? tags.join(", ") : ""}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-800">
                      Requirements:
                    </span>
                    <ul className="list-disc ml-6 text-gray-700">
                      {Array.isArray(requirements) &&
                        requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">
                      Learning Outcomes:
                    </span>
                    <ul className="list-disc ml-6 text-gray-700">
                      {Array.isArray(learningOutcomes) &&
                        learningOutcomes.map((outcome, idx) => (
                          <li key={idx}>{outcome}</li>
                        ))}
                    </ul>
                  </div>
                </section>
              </div>

              {/* Right Column - Course Card */}
              <div className="lg:col-span-1 sm:px-0 md:px-0 lg:px-20">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
                  {/* Course Image */}
                  <div className="relative rounded-t-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={title || "Course thumbnail"}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full animate-pulse bg-gray-200" />
                    )}
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ৳{price}
                      </div>
                      <p className="text-gray-600">One-time payment</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <Button
                        size="lg"
                        className="w-full btn-hover text-white"
                        style={{
                          backgroundColor: "var(--color-text-primary)",
                          borderColor: "var(--color-text-primary)",
                        }}
                        onClick={() => {
                          if (!user) {
                            router.push(`/login?next=/courses/${id}`);
                            return;
                          }
                          router.push(`/enroll?courseId=${id}`);
                        }}
                      >
                        Enroll Now
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        This course includes:
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {duration} minutes of content
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Lifetime access
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Certificate of completion
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={selectedVideoUrl}
        title={selectedVideoTitle}
      />

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        redirectUrl={loginRedirectUrl}
      />
    </MainLayout>
  );
}
