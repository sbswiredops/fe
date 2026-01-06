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
                {/* Category & Title */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                    {category?.icon} {category?.name}
                    {category?.isActive === false && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 rounded">
                        Inactive
                      </span>
                    )}
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                  {shortDescription && (
                    <p className="text-base text-gray-500 mb-2">
                      {shortDescription}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-xl text-gray-600">{description}</p>
                </div>

                {/* Course Intro Video */}
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

                {/* Meta Info Row */}
                <div className="flex flex-wrap gap-3 mb-4">
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
                
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {duration} min
                  </span>
                </div>

                {/* Price & Discount */}
                <div className="mb-2 flex items-center gap-3">
                  {discountPrice ? (
                    <>
                      <span className="line-through text-gray-400">
                        ৳{price}
                      </span>
                      <span className="text-red-600 font-bold">
                        ৳{discountPrice}
                      </span>
                      <span className="text-green-600">
                        ({discountPercentage}% off)
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-blue-600">৳{price}</span>
                  )}
                </div>

                {/* Rating, Reviews, Total Content */}
                <div className="mb-2 flex flex-wrap gap-8">
                  <span>
                    <span className="font-semibold text-gray-800">Rating:</span>{" "}
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
                  <span>
                    <span className="font-semibold text-gray-800">
                      Enrollment:
                    </span>{" "}
                    <span className="text-gray-700">{enrollmentCount}</span>
                  </span>
                </div>

                {/* Dates */}
                <div className="mb-2 text-xs text-gray-400">
                  Created: {new Date(createdAt).toLocaleDateString()} | Updated:{" "}
                  {new Date(updatedAt).toLocaleDateString()}
                </div>

                {/* Category Description */}
                {category?.description && (
                  <div className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Category Info:</span>{" "}
                    {category.description}
                  </div>
                )}

                {/* Tags, Requirements, Learning Outcomes */}
                <section className="mt-6 space-y-4">
                  {Array.isArray(tags) && tags.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800">Tags:</span>{" "}
                      <span className="text-gray-700">{tags.join(", ")}</span>
                    </div>
                  )}
                  {Array.isArray(requirements) && requirements.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800">
                        Requirements:
                      </span>
                      <ul className="list-disc ml-6 text-gray-700">
                        {requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(learningOutcomes) &&
                    learningOutcomes.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-800">
                          Learning Outcomes:
                        </span>
                        <ul className="list-disc ml-6 text-gray-700">
                          {learningOutcomes.map((outcome, idx) => (
                            <li key={idx}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
