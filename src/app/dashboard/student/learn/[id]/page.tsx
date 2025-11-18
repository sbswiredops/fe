/* eslint-disable @next/next/no-img-element */
"use client";

import React, { JSX, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { Course, Section, Lesson } from "@/types/api";

const userService = new UserService();

interface CourseDetail extends Course {
  sections?: Section[];
  instructorBio?: string;
}

function CourseHeader({
  course,
}: {
  course: CourseDetail;
}): JSX.Element {
  return (
    <>
      {/* Dark Header Background */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            {String(course.title || "Untitled Course")}
          </h1>
        </div>
      </div>

      {/* Course Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Course Info - Left Side */}
          <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h2 className="text-xl font-bold text-gray-900">
                {String(course.title || "Untitled")}
              </h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8 line-clamp-3">
              {String(course.description || "No description available")}
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                শুরু করুন
              </button>
            </div>
          </div>

          {/* Thumbnail - Right Side */}
          <div className="lg:col-span-1 bg-gradient-to-br from-red-700 to-red-900 relative min-h-64 lg:min-h-auto flex items-center justify-center overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-red-300 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CourseInfoSection({
  course,
}: {
  course: CourseDetail;
}): JSX.Element {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-6 bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            {String(course.category || "General")} কোর্স - {String(
              (course as any)?.totalLessons ||
                (Array.isArray(course.sections)
                  ? course.sections.reduce(
                      (sum: number, section: any) =>
                        sum +
                        (Array.isArray(section.lessons)
                          ? section.lessons.length
                          : 0),
                      0
                    )
                  : 0)
            )}{" "}
            পাঠ এবং সম্পূর্ণ প্রশিক্ষণ উপাদান
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            Facebook সাপোর্ট গ্রুপ বিস্তারিত
          </h3>
          <p className="text-gray-600 text-xs leading-relaxed">
            স্পীকার ইংরেজি{String(course.category || "কোর্স")}এ সম্পূর্ণ গাইডলাইন সহ{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Facebook সাপোর্ট গ্রুপ
            </a>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            স্পীকার ইংরেজি অনুশীলন ক্লাস
          </h3>
          <p className="text-gray-600 text-xs leading-relaxed">
            প্রতি সপ্তাহে ২০০ টি লাইভ ক্লাস কর�� হয় এবং প্রত্যেকেরই প্রশিক্ষণ দেওয়া হয়
          </p>
        </div>
      </div>
    </div>
  );
}

function LessonItem({
  lesson,
  allLessons,
  section,
  courseId,
}: {
  lesson: Lesson;
  allLessons: Lesson[];
  section: Section;
  courseId: string;
}): JSX.Element {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState<string>("");
  const [isLoadingCreator, setIsLoadingCreator] = useState(true);

  useEffect(() => {
    const fetchCreatorName = async () => {
      if (lesson.createdBy) {
        try {
          const response = await userService.getById(lesson.createdBy);
          if (response.data) {
            setCreatorName(response.data.name || response.data.email || "Unknown");
          } else {
            setCreatorName("Unknown");
          }
        } catch (error: any) {
          const status = error?.message?.includes('403') ? 403 : null;
          if (status === 403) {
            setCreatorName("Course Creator");
          } else {
            console.error("Failed to fetch creator info:", error);
            setCreatorName("Unknown");
          }
        }
      }
      setIsLoadingCreator(false);
    };

    fetchCreatorName();
  }, [lesson.createdBy]);

  const getFileName = (path: string) => {
    return path.split("/").pop() || "Download";
  };

  const handleOpenLesson = () => {
    router.push(
      `/dashboard/student/learn/lesson/${lesson.id}?courseId=${courseId}&sectionId=${section.id}`
    );
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2z" />
        </svg>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">
            {String(lesson.title || "Untitled")}
          </h4>
          {lesson.duration && (
            <p className="text-xs text-gray-500 mt-0.5">
              {String(lesson.duration)} min
            </p>
          )}
        </div>
        {lesson.isFree && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
            Free
          </span>
        )}
      </div>

      <div className="ml-7 space-y-2">
        {lesson.video && (
          <button
            onClick={handleOpenLesson}
            className="flex items-center gap-2 text-xs text-blue-600 hover:underline cursor-pointer"
          >
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 .5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h8z" />
            </svg>
            Watch Video
          </button>
        )}

        {lesson.resource && (
          <button
            onClick={handleOpenLesson}
            className="flex items-center gap-2 text-xs text-blue-600 hover:underline cursor-pointer"
          >
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a2 2 0 012-2h4a1 1 0 01.894.553l1.5 3a1 1 0 01-.894 1.447h-.5a1 1 0 00-.894.553l-.5 1a1 1 0 01-.894.553H9a1 1 0 00-.894.553l-1 2A1 1 0 007 12h-.5a1 1 0 01-.894-.553l-1-2A1 1 0 004 9V4z" clipRule="evenodd" />
            </svg>
            {getFileName(lesson.resource)}
          </button>
        )}

        {lesson.createdBy && (
          <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 border-t border-gray-200">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>
              By{" "}
              {isLoadingCreator ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <span className="font-medium text-gray-700">{creatorName}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const iconColors = [
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-yellow-100", text: "text-yellow-600" },
  { bg: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-red-100", text: "text-red-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-purple-100", text: "text-purple-600" },
];

function AccordionItem({
  section,
  isOpen,
  onToggle,
  index,
  courseId,
}: {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  courseId: string;
}): JSX.Element {
  const lessonCount = Array.isArray(section.lessons) ? section.lessons.length : 0;
  const colorScheme = iconColors[index % iconColors.length];

  const getIconByIndex = (idx: number) => {
    switch (idx % 5) {
      case 0:
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 1:
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 2:
        return (
          <svg
            className="w-5 h-5"
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
        );
      case 3:
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 7H7v6h6V7z" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
          </svg>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left flex-1">
          <div className={`w-10 h-10 rounded-full ${colorScheme.bg} flex items-center justify-center flex-shrink-0 ${colorScheme.text}`}>
            {getIconByIndex(index)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {String(section.title || "Section")}
            </h3>
            <p className="text-xs text-gray-500">
              {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-lg flex-shrink-0">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="bg-gray-50 border-t border-gray-200">
          {Array.isArray(section.lessons) && section.lessons.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {[...section.lessons].sort((a: Lesson, b: Lesson) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((lesson: Lesson, lessonIdx: number) => (
                <LessonItem
                  key={lesson.id || lessonIdx}
                  lesson={lesson}
                  allLessons={section.lessons || []}
                  section={section}
                  courseId={String(courseId || "")}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-4 text-gray-500 text-sm text-center">
              No lessons available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourseContents({
  sections,
  courseId,
}: {
  sections: Section[];
  courseId: string;
}): JSX.Element {
  const sortedSections = [...sections].sort((a: Section, b: Section) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sortedSections[0]?.id])
  );

  const toggleSection = (sectionId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(sectionId)) {
      newOpen.delete(sectionId);
    } else {
      newOpen.add(sectionId);
    }
    setOpenSections(newOpen);
  };

  if (!Array.isArray(sections) || sections.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <p className="text-gray-500">No course content available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">কোর্স তথ্যসম</h2>
      <div>
        {sortedSections.map((section: Section, index: number) => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            index={index}
            courseId={courseId}
          />
        ))}
      </div>
    </div>
  );
}

export default function Page(): JSX.Element {
  const params = useParams();
  const id = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const { getById } = useEnrolledCourses();
  const userId = user?.id;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const local = getById(String(id)) as any;
    if (local && typeof local === "object" && local.id) {
      setCourse({
        ...local,
        sections: Array.isArray(local.sections) ? local.sections : [],
      } as CourseDetail);
      setLoading(false);
      return;
    }

    if (authLoading || !userId) {
      return;
    }

    let ignore = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await userService.getEnrolledCourses(userId);
        const coursesList = response?.data?.courses;

        if (Array.isArray(coursesList) && coursesList.length > 0) {
          const found = coursesList.find(
            (c: any) => c && typeof c === "object" && String(c.id) === String(id)
          );

          if (!ignore && found && typeof found === "object" && found.id) {
            setCourse({
              ...found,
              sections: Array.isArray(found.sections) ? found.sections : [],
            } as CourseDetail);
          } else if (!ignore) {
            setError("Course not found");
          }
        } else if (!ignore) {
          setError("No courses found");
        }
      } catch (err: any) {
        if (!ignore) {
          console.error("Error fetching enrolled courses:", err);
          setError("Failed to load course");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id, userId, authLoading, getById]);

  useEffect(() => {
    if (!userId || authLoading) return;
    userService.getContinueLearning(userId).catch(() => void 0);
  }, [userId, authLoading]);

  const isAuthChecking = authLoading || (loading && !course && !error);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {isAuthChecking && (
          <div className="p-8 text-center text-gray-600">লো��� হচ্���ে...</div>
        )}

        {error && !isAuthChecking && (
          <div className="p-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isAuthChecking && !error && !course && (
          <div className="p-12 text-center">
            <p className="text-red-600 text-lg font-semibold">
              কোর্স খুঁজ�� পাওয়া যায়নি
            </p>
          </div>
        )}

        {!isAuthChecking && !error && course && (
          <>
            <CourseHeader course={course} />
            <CourseInfoSection course={course} />
            {Array.isArray(course.sections) && course.sections.length > 0 && (
              <CourseContents sections={course.sections} courseId={id} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
