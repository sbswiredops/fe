"use client";

import React, { JSX, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { UserService } from "@/services/userService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { Course, Section, Lesson } from "@/types/api";

const userService = new UserService();
export const runtime = 'edge';

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
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {String(course.title || "Untitled Course")}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
              {String(course.description || "No description available")}
            </p>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 text-lg shadow-lg">
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
}): JSX.Element {
  const totalLessons = Array.isArray(course.sections)
    ? course.sections.reduce(
        (sum: number, section: any) =>
          sum +
          (Array.isArray(section.lessons)
            ? section.lessons.length
            : 0),
        0
      )
    : 0;

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {String(course.category || "General")} Course
              </h3>
              <p className="text-gray-600 text-sm">
                {totalLessons} lessons • Complete learning materials
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{totalLessons}</div>
            <div className="text-sm text-gray-500">Total Lessons</div>
          </div>
        </div>
      </div>
    </div>
  );
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
      `/dashboard/student/learn/lesson/${lesson.id}?courseId=${courseId}&sectionId=${section.id}`
    );
  };

  const getFileName = (path: string) => {
    return path.split("/").pop() || "Download";
  };

  return (
    <div className="flex items-start gap-4 py-4 px-2 border-b border-gray-100 last:border-b-0">
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
          {/* Empty checkbox - will be filled when completed */}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm mb-2">
              {String(lesson.title || "Untitled Lesson")}
            </h4>
            
            {/* Resource Files - Clickable */}
            <div className="space-y-1 mb-3">
              {lesson.video && (
                <div 
                  onClick={handleOpenLesson}
                  className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 .5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h8z" />
                  </svg>
                  <span className="font-mono text-gray-500 text-xs hover:text-blue-600">video.m3u8</span>
                </div>
              )}

              {lesson.resource && (
                <div 
                  onClick={handleOpenLesson}
                  className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-green-600 transition-colors"
                >
                  <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-mono text-gray-500 text-xs hover:text-green-600">{getFileName(lesson.resource)}</span>
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
      `/dashboard/student/learn/quiz/${quiz.id}?courseId=${courseId}&sectionId=${section.id}`
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
              <svg className="w-3 h-3 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-500">Quiz assessment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const lessonCount = Array.isArray(section.lessons) ? section.lessons.length : 0;
  const quizCount = section.quizzes ? section.quizzes.length : 0;
  const totalItems = lessonCount + quizCount;

  // Mock quiz data
  const mockQuiz = { id: 'quiz-1', title: 'Section Quiz' };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white hover:border-gray-300 transition-colors">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">
                {index + 1}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              {String(section.title || "Untitled Section")}
            </h3>
            <p className="text-sm text-gray-600">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
              {lessonCount > 0 && ` • ${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`}
              {quizCount > 0 && ` • ${quizCount} quiz${quizCount === 1 ? '' : 'zes'}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            {/* Lessons */}
            {Array.isArray(section.lessons) && section.lessons.length > 0 ? (
              section.lessons
                .sort((a: Lesson, b: Lesson) => (a.orderIndex || 0) - (b.orderIndex || 0))
                .map((lesson: Lesson, lessonIdx: number) => (
                  <LessonItem
                    key={lesson.id || lessonIdx}
                    lesson={lesson}
                    section={section}
                    courseId={String(courseId || "")}
                  />
                ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No lessons available in this section
              </div>
            )}

            {/* Quiz */}
            {index === 0 && ( // Show quiz only for first section as in the example
              <QuizItem
                quiz={mockQuiz}
                section={section}
                courseId={String(courseId || "")}
              />
            )}
          </div>
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

  const totalLessons = sections.reduce((sum, section) => 
    sum + (Array.isArray(section.lessons) ? section.lessons.length : 0), 0
  );

  if (!Array.isArray(sections) || sections.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-500 font-medium">No course content available yet</p>
        <p className="text-gray-400 mt-2 text-sm">Check back later for updated curriculum</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
      </div>
      <div className="p-6">
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