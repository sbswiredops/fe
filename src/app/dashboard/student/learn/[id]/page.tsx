"use client";

import React, { JSX, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { Course, Section, Lesson } from "@/types/api";
import { Lock, FileText, Video, HelpCircle } from "lucide-react";

const userService = new UserService();
export const runtime = "edge";

interface CourseDetail extends Course {
  sections?: Section[];
  instructorBio?: string;
}

function CourseHeader({ course }: { course: CourseDetail }): JSX.Element {
  const router = useRouter();

  // Find the first lesson id and section id
  let firstLessonId: string | null = null;
  let firstSectionId: string | null = null;
  if (Array.isArray(course.sections) && course.sections.length > 0) {
    const sortedSections = [...course.sections].sort(
      (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0),
    );
    for (const section of sortedSections) {
      if (Array.isArray(section.lessons) && section.lessons.length > 0) {
        const sortedLessons = [...section.lessons].sort(
          (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0),
        );
        firstLessonId = sortedLessons[0]?.id;
        firstSectionId = section.id;
        break;
      }
    }
  }

  const handleStartLearning = () => {
    if (firstLessonId && firstSectionId && course.id) {
      router.push(
        `/dashboard/student/learn/lesson/${firstLessonId}?courseId=${course.id}&sectionId=${firstSectionId}`,
      );
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {String(course.title || "Untitled Course")}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
              {String(course.description || "No description available")}
            </p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 text-lg shadow-lg"
              onClick={handleStartLearning}
              disabled={!firstLessonId}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start Learning
            </button>
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
}): JSX.Element | null {
  const totalLessons = Array.isArray(course.sections)
    ? course.sections.reduce(
        (sum: number, section: any) =>
          sum + (Array.isArray(section.lessons) ? section.lessons.length : 0),
        0,
      )
    : 0;

  return null; // Removed the info card div
}

function LessonItem({
  lesson,
  section,
  courseId,
}: {
  lesson: Lesson;
  section: Section;
  courseId: string;
}): JSX.Element {
  const router = useRouter();

  const handleOpenLesson = () => {
    router.push(
      `/dashboard/student/learn/lesson/${lesson.id}?courseId=${courseId}&sectionId=${section.id}`,
    );
  };

  const handleOpenResource = () => {
    router.push(
      `/dashboard/student/learn/lesson/${lesson.id}?courseId=${courseId}&sectionId=${section.id}&tab=resource`,
    );
  };

  const getFileName = (path: string) => {
    return path.split("/").pop() || "Download";
  };

  return (
    <div className="flex items-start gap-4 py-4 px-2 border-b border-gray-100 last:border-b-0">
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1"></div>

      {/* Lesson Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg mb-2">
              {String(lesson.title || "Untitled Lesson")}
            </h4>

            {/* Resource Files - Clickable */}
            <div className="space-y-1 mb-3">
              {lesson.video && (
                <div
                  onClick={handleOpenLesson}
                  className="flex items-center gap-2 text-lg text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <Video className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-mono text-gray-500 text-base hover:text-blue-600">
                    video.m3u8
                  </span>
                </div>
              )}

              {lesson.resource && (
                <div
                  onClick={handleOpenResource}
                  className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-green-600 transition-colors"
                >
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="font-mono text-gray-500 text-base hover:text-green-600">
                    {getFileName(lesson.resource)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          {lesson.duration && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0 ml-4">
              {String(lesson.duration)} min
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizItem({
  quiz,
  section,
  courseId,
}: {
  quiz: any;
  section: Section;
  courseId: string;
}): JSX.Element {
  const router = useRouter();

  const handleOpenQuiz = () => {
    router.push(
      `/dashboard/student/learn/quiz/${quiz.id}?courseId=${courseId}&sectionId=${section.id}`,
    );
  };

  return (
    <div className="flex items-start gap-4 py-4 px-2 border-b border-gray-100 last:border-b-0">
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
          {/* Empty checkbox */}
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4
              onClick={handleOpenQuiz}
              className="font-medium text-gray-900 text-sm mb-2 cursor-pointer hover:text-purple-600 transition-colors"
            >
              {quiz.title || "Section Quiz"}
            </h4>
            <div
              onClick={handleOpenQuiz}
              className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-purple-600 transition-colors"
            >
              <svg
                className="w-3 h-3 text-purple-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-500">Quiz assessment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSectionSummary(section: Section) {
  const lessonCount = Array.isArray(section.lessons)
    ? section.lessons.length
    : 0;
  const quizCount = Array.isArray(section.quizzes) ? section.quizzes.length : 0;
  const lessonDurations =
    section.lessons?.map((l) => Number(l.duration) || 0) || [];
  const quizDurations =
    section.quizzes?.map((q) => Number(q.duration) || 0) || [];
  const totalDuration = [...lessonDurations, ...quizDurations].reduce(
    (a, b) => a + b,
    0,
  );
  return { lessonCount, quizCount, totalDuration };
}

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
  const { lessonCount, quizCount, totalDuration } = getSectionSummary(section);

  return (
    <div className="bg-[#fafbfc] rounded-xl mb-3 shadow-sm border border-[#f3f4f6]">
      <div
        className="flex items-center px-5 py-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Number Icon */}
        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold text-xl mr-4">
          {index + 1}
        </div>
        {/* Title & Summary */}
        <div className="flex-1">
          <div className="font-bold text-lg text-gray-900">
            {section.title || `Module ${index + 1}`}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
            {quizCount > 0 &&
              ` • ${quizCount} quiz${quizCount !== 1 ? "zes" : ""}`}
            {totalDuration > 0 && ` • ${totalDuration} min`}
          </div>
        </div>
        {/* Expand Icon */}
        <svg
          className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      </div>
      {/* Lessons & Quizzes */}
      {isOpen && (
        <div className="bg-white px-8 pb-4 pt-2 rounded-b-xl">
          {/* Lessons */}
          {Array.isArray(section.lessons) &&
            section.lessons.length > 0 &&
            section.lessons.map((lesson: Lesson, lessonIdx: number) => (
              <div
                key={lesson.id || lessonIdx}
                className="flex items-center py-2 border-b last:border-b-0"
              >
                <Video className="w-5 h-5 text-blue-500 mr-3" />
                <div className="flex-1 text-gray-800 font-medium">
                  {lesson.title}
                </div>
                {lesson.duration && (
                  <div className="text-xs text-gray-500 mr-2">
                    {lesson.duration} min
                  </div>
                )}
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          {/* Quizzes */}
          {Array.isArray(section.quizzes) &&
            section.quizzes.length > 0 &&
            section.quizzes.map((quiz: any, quizIdx: number) => (
              <div
                key={quiz.id || quizIdx}
                className="flex items-center py-2 border-b last:border-b-0"
              >
                <HelpCircle className="w-5 h-5 text-purple-500 mr-3" />
                <div className="flex-1 text-gray-800 font-medium">
                  {quiz.title || "Quiz"}
                </div>
                {/* Quiz summary: questions, marks, duration */}
                <div className="text-xs text-gray-500 mr-2">
                  {quiz.questionCount} questions • {quiz.totalMarks} marks •{" "}
                  {quiz.duration} min
                </div>
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            ))}
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
  const sortedSections = [...sections].sort(
    (a: Section, b: Section) => (a.orderIndex || 0) - (b.orderIndex || 0),
  );
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sortedSections[0]?.id]),
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

  return (
    <div className="bg-transparent rounded-lg">
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
            (c: any) =>
              c && typeof c === "object" && String(c.id) === String(id),
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

  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") ?? null;
  const [viewMode, setViewMode] = useState<"video" | "pdf" | "quiz">(
    initialTab === "resource" ? "pdf" : "video",
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAuthChecking && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
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
              Course not found
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
