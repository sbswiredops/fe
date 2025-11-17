"use client";

import React, { JSX, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { Course, Section, Lesson } from "@/types/api";

const userService = new UserService();

interface CourseDetail extends Course {
  sections?: Section[];
  totalDuration?: string;
  instructorBio?: string;
}

function CourseHeader({
  course,
}: {
  course: CourseDetail;
}): JSX.Element {
  return (
    <div className="bg-white rounded-xl p-6 md:p-8 mb-6 border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Course Info */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {String(course.title || "Untitled Course")}
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {String(course.description || "No description available")}
          </p>

          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2">
            ▶ লাইভ ক্লাস
          </button>
        </div>

        {/* Thumbnail */}
        <div className="lg:col-span-1">
          <div className="bg-gray-100 rounded-xl overflow-hidden w-full aspect-square shadow-md border border-gray-200">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <svg
                  className="w-12 h-12 text-gray-500"
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
    </div>
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
            প্রতি সপ্তাহে ২০০ টি লাইভ ক্লাস করা হয় এবং প্রত্যেকেরই প্রশিক্ষণ দেওয়া হয়
          </p>
        </div>
      </div>
    </div>
  );
}

function AccordionItem({
  section,
  isOpen,
  onToggle,
}: {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  const lessonCount = Array.isArray(section.lessons) ? section.lessons.length : 0;

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left flex-1">
          <svg
            className={`w-5 h-5 text-blue-500 flex-shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
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
              {section.lessons.map((lesson: Lesson, lessonIdx: number) => (
                <div key={lesson.id || lessonIdx} className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {String(lesson.title || "Untitled")}
                      </h4>
                      {lesson.duration && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {String(lesson.duration)} min
                        </p>
                      )}
                    </div>
                    {lesson.isFree && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap">
                        Free
                      </span>
                    )}
                  </div>
                </div>
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
}: {
  sections: Section[];
}): JSX.Element {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sections[0]?.id])
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
      <h2 className="text-xl font-bold text-gray-900 mb-6">কোর্স বিষয়বস্তু</h2>
      <div>
        {sections.map((section: Section) => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
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
          <div className="p-8 text-center text-gray-600">লোড হচ্ছে...</div>
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
            <CourseDetailsGrid course={course} />
            {Array.isArray(course.sections) && course.sections.length > 0 && (
              <CourseContents sections={course.sections} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
