/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Course, Instructor, Category, Quiz } from "@/components/types";
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
import { Play, BookOpen, Lock, Unlock, Star, Users, Clock, Award, Tag, BookMarked } from "lucide-react";

export const runtime = "edge";

const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount?: number }) => {
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  const reviews = reviewCount || 0;
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(numRating) ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-lg text-gray-700 font-semibold">{numRating.toFixed(2)}</span>
      {reviews > 0 && <span className="text-sm text-gray-600">({reviews} reviews)</span>}
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
            instructor: course.instructor || "Unknown Instructor",
            instructorId: course.instructorId ?? "",
            duration: typeof course.duration === "string" ? course.duration : String(course.duration ?? ""),
            category: course.category || "General",
            createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
            sections: Array.isArray(course.sections)
              ? course.sections.map((sec) => ({
                  ...sec,
                  lessons: Array.isArray(sec.lessons) ? sec.lessons : [],
                  quizzes: Array.isArray(sec.quizzes) ? sec.quizzes : [],
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

  const getInstructorInfo = () => {
    if (typeof fetchedCourse.instructor === "object" && fetchedCourse.instructor !== null) {
      return fetchedCourse.instructor as Instructor;
    }
    return null;
  };

  const getCategoryInfo = () => {
    if (typeof fetchedCourse.category === "object" && fetchedCourse.category !== null) {
      return fetchedCourse.category as Category;
    }
    return null;
  };

  const instructorInfo = getInstructorInfo();
  const categoryInfo = getCategoryInfo();
  const categoryName = categoryInfo?.name || 
    (typeof fetchedCourse.category === "string" ? fetchedCourse.category : "General");

  const {
    title,
    description,
    shortDescription,
    thumbnail,
    courseIntroVideo,
    price,
    discountPrice,
    discountPercentage,
    duration,
    enrollmentCount,
    rating,
    reviewCount,
    instructor,
    sections,
    tags,
    requirements,
    learningOutcomes,
    type,
    level,
  } = fetchedCourse;

  const hasDiscount = discountPrice && discountPercentage;
  const discountedPrice = hasDiscount 
    ? typeof discountPrice === "string" ? discountPrice : discountPrice.toString()
    : null;

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
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {categoryName}
                    </span>
                    {type && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                        {type}
                      </span>
                    )}
                    {level && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {level}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {title}
                  </h1>
                  {shortDescription && (
                    <p className="text-lg text-gray-700 mb-4 italic">{shortDescription}</p>
                  )}
                  <p className="text-xl text-gray-600 mb-6">{description}</p>

                  {/* Course Stats */}
                  <div className="flex flex-wrap gap-6 py-6 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {typeof rating === "string" ? parseFloat(rating).toFixed(2) : rating?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-600">{reviewCount || 0} reviews</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{enrollmentCount}</div>
                        <div className="text-sm text-gray-600">Enrolled</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{duration}m</div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructor Section */}
                {instructorInfo && (
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
                    <div className="flex items-start gap-4">
                      {instructorInfo.avatar && (
                        <img
                          src={instructorInfo.avatar}
                          alt={instructorInfo.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {instructorInfo.name || instructorInfo.firstName}
                        </h3>
                        {instructorInfo.bio && (
                          <p className="text-gray-600 mt-2">{instructorInfo.bio}</p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Learning Outcomes */}
                {learningOutcomes && learningOutcomes.length > 0 && (
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-6 h-6 text-green-600" />
                      What You'll Learn
                    </h2>
                    <ul className="space-y-3">
                      {learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Requirements */}
                {requirements && requirements.length > 0 && (
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookMarked className="w-6 h-6 text-blue-600" />
                      Requirements
                    </h2>
                    <ul className="space-y-3">
                      {requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                          </svg>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Tag className="w-6 h-6 text-indigo-600" />
                      Topics
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Course Introduction Video */}
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

                {/* Course Content with Lessons and Quizzes */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Content Preview
                  </h2>
                  <Accordion
                    items={sections.map((section) => ({
                      id: section.id,
                      title: `${section.title}${section.isFinalSection ? " (Final Quiz)" : ""}`,
                      content: (
                        <div className="space-y-4">
                          {/* Lessons */}
                          {section.lessons && section.lessons.length > 0 && (
                            <>
                              <div className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">
                                Lessons ({section.lessons.length})
                              </div>
                              <div className="space-y-3">
                                {section.lessons.map((lesson: any) => {
                                  const canAccess = user && lesson.isFree;
                                  const isLocked = !lesson.isFree && !isEnrolled;

                                  return (
                                    <div
                                      key={lesson.id}
                                      className="flex items-start space-x-3 py-3 hover:bg-gray-50 transition-colors rounded px-2"
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
                                        {lesson.duration && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Duration: {lesson.duration} minutes
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex-shrink-0 flex items-center space-x-2">
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

                                        {isLocked ? (
                                          <Lock className="w-5 h-5 text-gray-400" />
                                        ) : lesson.isFree ? (
                                          <Unlock className="w-5 h-5 text-green-500" />
                                        ) : null}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {/* Quizzes */}
                          {section.quizzes && section.quizzes.length > 0 && (
                            <>
                              <div className="border-t pt-4 mt-4">
                                <div className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">
                                  Quizzes ({section.quizzes.length})
                                </div>
                                <div className="space-y-3">
                                  {section.quizzes.map((quiz: Quiz) => (
                                    <div
                                      key={quiz.id}
                                      className="flex items-start space-x-3 p-3 bg-amber-50 rounded border border-amber-200"
                                    >
                                      <div className="flex-shrink-0 pt-1">
                                        <Award className="w-5 h-5 text-amber-600" />
                                      </div>
                                      <div className="flex-grow">
                                        <h4 className="font-medium text-gray-900">
                                          {quiz.title}
                                        </h4>
                                        {quiz.description && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            {quiz.description}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-700">
                                          <span>Questions: {quiz.totalQuestions}</span>
                                          <span>Marks: {quiz.totalMarks}</span>
                                          <span>Time: {quiz.totalTime} min</span>
                                          <span>Pass: {quiz.passMark}%</span>
                                          {quiz.isFinalQuiz && (
                                            <span className="text-red-600 font-semibold">Final Quiz</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0">
                                        {quiz.isLocked ? (
                                          <Lock className="w-5 h-5 text-gray-400" />
                                        ) : (
                                          <Unlock className="w-5 h-5 text-green-500" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {!section.lessons?.length && !section.quizzes?.length && (
                            <p className="text-gray-600 py-3">
                              No content available in this section.
                            </p>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </section>
              </div>

              {/* Right Column - Course Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
                  {/* Course Image */}
                  <div className="relative rounded-t-xl overflow-hidden bg-gray-50 flex items-center justify-center h-48">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={title || "Course thumbnail"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full animate-pulse bg-gray-200" />
                    )}
                  </div>

                  <div className="p-6">
                    {/* Price Section */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <div className="text-4xl font-bold text-blue-600">
                          ৳{typeof price === "string" ? price : price?.toString()}
                        </div>
                        {hasDiscount && (
                          <div className="text-xl text-gray-400 line-through">
                            ৳{typeof discountPrice === "string" ? discountPrice : discountPrice?.toString()}
                          </div>
                        )}
                      </div>
                      {hasDiscount && (
                        <div className="text-lg font-bold text-green-600 mb-2">
                          Save {discountPercentage}%
                        </div>
                      )}
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
