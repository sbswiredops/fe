/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MainLayout from "@/components/layout/MainLayout";
import { Course } from "@/components/types";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { useAuth } from "@/components/contexts/AuthContext";
import { UserService } from "@/services/userService";
import { useParams } from "next/navigation";
import { CourseService } from "@/services/courseService";
import { useRouter } from "next/navigation";

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

const userService = new UserService();
const courseService = new CourseService();

export default function CourseDetailsPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { getById, setCourses } = useEnrolledCourses();
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [checkingEnroll, setCheckingEnroll] = useState<boolean>(false);
  const [fetchedCourse, setFetchedCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
  // Added: FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const courseFromContext = getById(String(id)) as any;
  const course = (courseFromContext as Course) || fetchedCourse;

  useEffect(() => {
    const local = getById(String(id));
    if (local) setIsEnrolled(true);
  }, [id, getById]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingCourse(true);
        const res = await courseService.getCourseById(String(id));
        const c = res?.data as any;
        if (!ignore && res?.success && c) {
          const instructorName =
            c?.instructor?.name ||
            [c?.instructor?.firstName, c?.instructor?.lastName]
              .filter(Boolean)
              .join(" ") ||
            c?.instructorId ||
            "Instructor";
          const categoryName =
            c?.category?.name || (c as any)?.category || "General";
          const created = c?.createdAt ? new Date(c.createdAt) : new Date();
          const durationStr =
            typeof c?.totalDuration === "string" && c?.totalDuration
              ? c.totalDuration
              : typeof c?.duration === "number"
              ? `${c.duration} min`
              : String(c?.duration || "");
          const mapped: Course = {
            id: String(c.id),
            title: String(c.title || ""),
            description: String(c.description || ""),
            instructor: String(instructorName),
            instructorId: String(c.instructorId || c?.instructor?.id || ""),
            price: Number(c.price ?? 0),
            duration: durationStr,
            thumbnail: c.thumbnail || "/placeholder-course.jpg",
            category: String(categoryName),
            enrolledStudents: Number(c.enrollmentCount ?? 0),
            rating: Number(c.rating ?? 0),
            createdAt: created,
          };
          setFetchedCourse(mapped);
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
    const uid = user?.id;
    if (!uid) return;
    let ignore = false;
    (async () => {
      try {
        setCheckingEnroll(true);
        const res = await userService.getEnrolledCourses(uid);
        const list = (res as any)?.data?.courses || [];
        if (!ignore && Array.isArray(list)) {
          setCourses(list);
          const has = list.some((c: any) => String(c?.id) === String(id));
          if (has) setIsEnrolled(true);
        }
      } finally {
        if (!ignore) setCheckingEnroll(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user?.id, id, setCourses]);

  const instructorDisplay =
    typeof (course as any)?.instructor === "string"
      ? (course as any).instructor
      : (course as any)?.instructor?.name ||
        [
          (course as any)?.instructor?.firstName,
          (course as any)?.instructor?.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        (course as any)?.instructorId ||
        "Instructor";

  // client-side redirect to 404 if course not found after load
  useEffect(() => {
    if (!loadingCourse && !course) {
      // replace current route with 404 page
      router.replace("/404");
    }
  }, [loadingCourse, course, router]);

  const categoryStr = course
    ? typeof (course as any).category === "string"
      ? (course as any).category
      : (course as any).category?.name ||
        (course as any).category?.title ||
        "Course"
    : "Course";

  const courseModules = [
    {
      title: "Introduction & Setup",
      duration: "2 hours",
      lessons: 8,
      description:
        "Get started with the fundamentals and set up your development environment",
    },
    {
      title: "Core Concepts",
      duration: "4 hours",
      lessons: 12,
      description: "Learn the essential concepts and principles",
    },
    {
      title: "Practical Applications",
      duration: "6 hours",
      lessons: 15,
      description: "Apply your knowledge through hands-on projects",
    },
    {
      title: "Advanced Topics",
      duration: "5 hours",
      lessons: 10,
      description: "Master advanced techniques and best practices",
    },
    {
      title: "Final Project",
      duration: "3 hours",
      lessons: 5,
      description: "Build a complete project from start to finish",
    },
  ];

  const prerequisites = [
    "Basic computer literacy",
    "Access to a computer with internet connection",
    "Willingness to learn and practice",
    categoryStr.toLowerCase() === "programming"
      ? "Basic understanding of HTML/CSS (helpful but not required)"
      : "No prior experience required",
  ];

  const enrolledCount = Number(
    (course as any)?.enrolledStudents ??
      (course as any)?.students ??
      (course as any)?.studentsCount ??
      (course as any)?.enrollmentCount ??
      0
  );
  const priceValue = Number((course as any)?.price ?? 0);

  const whatYouWillLearn = [
    `Complete mastery of ${
      categoryStr ? String(categoryStr).toLowerCase() : "course"
    } fundamentals`,
    "Hands-on experience with real-world projects",
    "Industry best practices and professional techniques",
    "Problem-solving skills and critical thinking",
    "Portfolio-ready projects to showcase your skills",
    "Certificate of completion",
  ];

  // Added: extra content data

  const targetAudience = [
    "Beginners looking to start in this field",
    "Students who prefer learning by doing",
    "Professionals upskilling with modern best practices",
    "Anyone switching careers into this domain",
  ];

  const tools = [
    "VS Code",
    "Git & GitHub",
    "Modern Browser DevTools",
    "Node.js & npm/yarn",
    "Popular libraries & frameworks",
  ];

  const faqs = [
    {
      question: "How long do I have access to the course?",
      answer:
        "You get lifetime access, including future updates and improvements.",
    },
    {
      question: "Do I need prior experience?",
      answer:
        "No prior experience is required. The course starts from basics and progresses to advanced topics.",
    },
    {
      question: "Will I get a certificate?",
      answer:
        "Yes, a certificate of completion is available after you finish the course.",
    },
    {
      question: "Is there a refund policy?",
      answer:
        "Yes, we offer a satisfaction guarantee. Contact support within the refund window for assistance.",
    },
  ];

  // Helper: fake rating distribution for the review bars
  const rating = Number(course?.rating ?? 0);
  const ratingDistribution = [55, 25, 12, 5, 3]; // 5★..1★ example percentages

  // Added: right-side helpers
  const lastUpdated = course?.createdAt
    ? new Date(course.createdAt as any).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const skillTags = Array.from(
    new Set(
      [
        categoryStr,
        "Beginner friendly",
        "Project-based",
        "Problem solving",
        "Version control",
        "Best practices",
      ].filter(Boolean)
    )
  ) as string[];

  return (
    <MainLayout>
      <div className="min-h-screen   bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b ">
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
                <span className="text-gray-900">
                  {course ? course.title : ""}
                </span>
              </div>
            </nav>

            <div className="grid lg:grid-cols-3 gap-8 ">
              {/* Left Column - Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                    {categoryStr}
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {course ? course.title : ""}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6">
                    {course ? course.description : ""}
                  </p>
                </div>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center">
                    <StarRating rating={course ? course.rating ?? 0 : 0} />
                    <span className="ml-2 text-gray-600">
                      ({enrolledCount.toLocaleString()} students)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {course ? course.duration : ""}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {instructorDisplay}
                  </div>
                </div>
              </div>

              {/* Right Column - Course Card */}
              <div className="lg:col-span-1 sm:px-0 md:px-0 lg:px-20 ">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
                  {/* Course Image */}
                  <div className="relative  rounded-t-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {(course as any)?.thumbnail ? (
                      <img
                        src={(course as any).thumbnail}
                        alt={course?.title || "Course thumbnail"}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          // hide broken image so fallback is visible
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : loadingCourse ? (
                      <div className="w-full h-full animate-pulse bg-gray-200" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-20 h-20 text-blue-500 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ৳{priceValue}
                      </div>
                      <p className="text-gray-600">One-time payment</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {isEnrolled ? (
                        <Link href={`/dashboard/student/learn/${id}`}>
                          <Button
                            size="lg"
                            className="w-full btn-hover text-white"
                            style={{
                              backgroundColor: "var(--color-text-primary)",
                              borderColor: "var(--color-text-primary)",
                            }}
                          >
                            Continue Learning
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Button
                            size="lg"
                            className="w-full btn-hover text-white"
                            style={{
                              backgroundColor: "var(--color-text-primary)",
                              borderColor: "var(--color-text-primary)",
                            }}
                            disabled={checkingEnroll || loadingCourse}
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
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full btn-hover"
                            style={{
                              borderColor: "var(--color-text-primary)",
                              color: "var(--color-text-primary)",
                              backgroundColor: "rgba(80, 53, 110, 0.05)",
                            }}
                            disabled={checkingEnroll}
                          >
                            Add to Wishlist
                          </Button>
                        </>
                      )}
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
                          {course ? course.duration : ""} of content
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
                          Mobile and desktop access
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What you'll learn
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-3 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Course Content */}
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course content
                </h2>
                <div className="space-y-4">
                  {courseModules.map((module, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg"
                    >
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-4">
                              {module.lessons} lessons
                            </span>
                            <span>{module.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600">{module.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Added: Highlights */}
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Prerequisites
                </h2>
                <ul className="space-y-3">
                  {prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Added: Who is this course for? */}
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Who is this course for?
                </h2>
                <ul className="space-y-3">
                  {targetAudience.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-3 text-purple-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  About the instructor
                </h2>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {instructorDisplay}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Expert {categoryStr} instructor with over 10 years of
                      industry experience. Has taught thousands of students and
                      helped them achieve their career goals.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>⭐ 4.9 Instructor Rating</span>
                      <span>👥 {enrolledCount.toLocaleString()}+ Students</span>
                      <span>🎓 50+ Courses</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Added: Student Reviews */}
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Student reviews
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 border rounded-lg">
                    <div className="text-5xl font-bold text-gray-900">
                      {rating.toFixed(1)}
                    </div>
                    <div className="mt-2">
                      <StarRating rating={rating} />
                    </div>
                    <p className="text-gray-600 mt-2">
                      Based on {Math.max(enrolledCount, 25).toLocaleString()}+
                      ratings
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars, idx) => {
                      const pct = ratingDistribution[idx] ?? 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="w-6 text-sm text-gray-600">
                            {stars}★
                          </span>
                          <div className="flex-1 h-3 bg-gray-100 rounded">
                            <div
                              className="h-3 bg-yellow-400 rounded"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-sm text-gray-600">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Example review cards */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              Student {i}
                            </div>
                            <div className="text-xs text-gray-500">
                              Verified
                            </div>
                          </div>
                        </div>
                        <div className="text-yellow-500">
                          <StarRating rating={5 - (i % 2)} />
                        </div>
                      </div>
                      <p className="text-gray-700 mt-3">
                        Great course with clear explanations and practical
                        projects. Highly recommended for beginners and
                        intermediates alike.
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Added: FAQs */}
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQs</h2>
                <div className="divide-y divide-gray-200">
                  {faqs.map((item, idx) => {
                    const open = openFaqIndex === idx;
                    return (
                      <div key={idx}>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between py-4 text-left"
                          onClick={() => setOpenFaqIndex(open ? null : idx)}
                          aria-expanded={open}
                          aria-controls={`faq-panel-${idx}`}
                        >
                          <span className="font-medium text-gray-900">
                            {item.question}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div
                          id={`faq-panel-${idx}`}
                          className={`overflow-hidden transition-all ${
                            open ? "max-h-96" : "max-h-0"
                          }`}
                        >
                          <p className="pb-4 text-gray-600">{item.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column - Additional Info */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Course Features */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Course Features
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {course ? course.duration : ""}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">Students Enrolled</span>
                      <span className="font-medium">
                        {enrolledCount.toLocaleString()}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="font-medium">English</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-medium">Beginner</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">Certificate</span>
                      <span className="font-medium">Yes</span>
                    </li>
                  </ul>
                </section>

                {/* Share Course */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Share this course
                  </h3>
                  <div className="flex space-x-3">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </button>
                  </div>
                </section>

                {/* Related Courses */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Related courses
                  </h2>
                  <ul className="space-y-3">
                    {[
                      "Complete Beginner’s Guide",
                      "Advanced Techniques & Patterns",
                      "Build a Full Project from Scratch",
                    ].map((rc, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mt-1 mr-2 text-indigo-600">•</span>
                        <Link
                          href="/courses"
                          className="text-gray-700 hover:text-indigo-600"
                        >
                          {rc}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Added: Skills you’ll gain */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Skills you’ll gain
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Added: Guarantee & support */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Guarantee & support
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      7‑day money‑back guarantee
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Q&A and community help
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Certificate upon completion
                    </li>
                  </ul>
                  <div className="mt-4">
                    <Link
                      href="/contact"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Contact support
                    </Link>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
