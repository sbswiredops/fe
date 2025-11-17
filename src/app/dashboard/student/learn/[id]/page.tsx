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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Thumbnail */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg overflow-hidden w-full aspect-video shadow-md border border-gray-200">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                <svg
                  className="w-12 h-12 text-blue-500"
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

        {/* Course Info */}
        <div className="lg:col-span-3">
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {String(course.category || "General")}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {String(course.title || "Untitled Course")}
          </h1>

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {String(course.description || "No description available")}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(course.rating || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {Number(course.rating || 0).toFixed(1)}
              </span>
            </div>

            <div className="text-xs text-gray-600">
              📊 {Number(course.enrollmentCount || 0).toLocaleString()} students
            </div>

            <div className="text-xs text-gray-600">
              ⏱️ {String(course.totalDuration || course.duration || "Self-paced")}
            </div>
          </div>

          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2">
            ▶ শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function CourseDetailsGrid({
  course,
}: {
  course: CourseDetail;
}): JSX.Element {
  const instructorName = String(
    (course as any)?.instructor?.name ||
      (course as any)?.instructor?.firstName ||
      "Expert"
  );

  const totalLessons = String(
    (course as any)?.totalLessons ||
      (Array.isArray(course.sections)
        ? course.sections.reduce(
            (sum: number, section: any) =>
              sum + (Array.isArray(section.lessons) ? section.lessons.length : 0),
            0
          )
        : 0)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <DetailBox icon="👨‍🏫" label="Instructor" value={instructorName} />
      <DetailBox
        icon="📊"
        label="Level"
        value={String(course.level || "All").toUpperCase()}
      />
      <DetailBox icon="📚" label="Lessons" value={totalLessons} />
      <DetailBox icon="🏆" label="Certificate" value="Available" />
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
