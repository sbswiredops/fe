/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useRef, JSX } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { VideoPlayer } from "@/components/VideoPlayer";
import { userService } from "@/services/userService";
import { courseService } from "@/services/courseService";
import { lessonService } from "@/services/lessonService";
import { Lesson, Section, Course } from "@/types/api";
import { useAuth } from "@/components/contexts/AuthContext";
import QuizViewer from "@/components/ui/QuizViewer";
import PDFViewer from "@/components/ui/PDFViwer";

type CourseDetail = Course & {
  sections?: Section[];
  instructorBio?: string;
};

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const lessonId = String(params.lessonId || "");
  const courseId = searchParams.get("courseId");
  const sectionId = searchParams.get("sectionId");

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [creatorName, setCreatorName] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const [viewMode, setViewMode] = useState<"video" | "pdf" | "quiz">("video");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: string; title: string } | null>(null);

  const cancelledRef = useRef(false);

  // --------------------------
  // Fetch course, section, lesson
  // --------------------------
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !courseId || !sectionId) return;

      cancelledRef.current = false;
      setViewMode("video");
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setPdfError(null);

      try {
        const courseResponse = await courseService.getCourseById(courseId);
        if (!courseResponse.data) {
          setError("Course not found");
          setIsLoading(false);
          return;
        }
        const courseData = courseResponse.data;
        setCourse(courseData);

        const foundSection = courseData.sections?.find((s) => s.id === sectionId) || null;
        setSection(foundSection);

        const foundLesson = foundSection?.lessons?.find((l) => l.id === lessonId) || null;
        setLesson(foundLesson);

        if (foundSection?.id) setExpandedSections(new Set([foundSection.id]));

        if (foundLesson?.createdBy) {
          try {
            const userResponse = await userService.getById(foundLesson.createdBy);
            setCreatorName(userResponse.data?.name || userResponse.data?.email || "Unknown");
          } catch (err: any) {
            const status = err?.message?.includes("403") ? 403 : null;
            setCreatorName(status === 403 ? "Course Creator" : "Unknown");
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
        setError("Failed to load lesson");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authLoading, courseId, sectionId, lessonId]);

  // --------------------------
  // Handle lesson navigation
  // --------------------------
  const handleLessonSelect = (selectedLesson: Lesson, secId: string) => {
    cancelledRef.current = false;
    setViewMode("video");
    setPdfUrl(null);
    setPdfError(null);

    router.push(
      `/dashboard/student/learn/lesson/${selectedLesson.id}?courseId=${courseId}&sectionId=${secId}`
    );
  };

  // --------------------------
  // Load PDF resource
  // --------------------------
  const loadPdf = async () => {
    if (!lesson?.id) return;

    cancelledRef.current = false;
    setIsPdfLoading(true);
    setPdfError(null);

    try {
      const blob = await lessonService.getLessonPdfBlob(lesson.id);
      if (cancelledRef.current) return;

      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      setViewMode("pdf");
    } catch (err: any) {
      if (cancelledRef.current) return;
      const status = err?.response?.status ?? err?.status;
      setPdfError(status === 404 ? "PDF not available for this lesson." : err?.message || "Failed to load lesson PDF.");
      setPdfUrl(null);
    } finally {
      if (!cancelledRef.current) setIsPdfLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // --------------------------
  // Sort lessons
  // --------------------------
  const sortedLessons = section?.lessons
    ? [...section.lessons].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    : [];

  // --------------------------
  // Loading / Error UI
  // --------------------------
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lesson...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lesson || !section || !course) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg p-8 text-center max-w-md border border-gray-200">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-900 font-semibold mb-4">{error || "Lesson not found"}</p>
            <button
              onClick={() => router.back()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --------------------------
  // Content Toggle Button Component
  // --------------------------
  const ContentToggleButton = (props: {
    label: string;
    icon: JSX.Element;
    active: boolean;
    onClick: () => void;
    loading?: boolean;
  }) => {
    const { label, icon, active, onClick, loading } = props;
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          active
            ? "bg-purple-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        }`}
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {icon}
        {label}
      </button>
    );
  };

  // --------------------------
  // Main Render
  // --------------------------
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 sm:px-8 py-4">
            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            <p className="text-blue-100 text-sm mt-2">
              {section.title} • {course.title}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 sm:p-8">
            {/* Lesson Content */}
            <div className="lg:col-span-2">
              {lesson.video || lesson.resource || (section?.quizzes && section.quizzes.length > 0) ? (
                <>
                  {/* Toggle Buttons */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {lesson.video && (
                      <ContentToggleButton
                        label="Video"
                        icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 .5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h8z"/></svg>}
                        active={viewMode === "video"}
                        onClick={() => setViewMode("video")}
                      />
                    )}
                    {lesson.resource && (
                      <ContentToggleButton
                        label="Resource"
                        icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a2 2 0 012-2h4a1 1 0 01.894.553l1.5 3a1 1 0 01-.894 1.447h-.5a1 1 0 00-.894.553l-.5 1a1 1 0 01-.894.553H9a1 1 0 00-.894.553l-1 2A1 1 0 007 12h-.5a1 1 0 01-.894-.553l-1-2A1 1 0 004 9V4z" clipRule="evenodd"/></svg>}
                        active={viewMode === "pdf"}
                        onClick={loadPdf}
                        loading={isPdfLoading}
                      />
                    )}
                    {/* Section Quizzes */}
                    {section?.quizzes?.length > 0 && section.quizzes.map((quiz) => (
                      <ContentToggleButton
                        key={quiz.id}
                        label={quiz.title}
                        icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"/></svg>}
                        active={viewMode === "quiz" && selectedQuiz?.id === quiz.id}
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setViewMode("quiz");
                        }}
                      />
                    ))}
                  </div>

                  {/* Content Viewer */}
                  {viewMode === "video" && lesson.video && (
                    <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
                      <VideoPlayer src={lesson.video} className="w-full h-full object-contain" autoPlay controls />
                    </div>
                  )}
                  {viewMode === "pdf" && lesson.resource && (
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-6 aspect-video border border-gray-200">
                      {pdfUrl ? (
                        <PDFViewer pdfUrl={pdfUrl} className="w-full h-full" onError={(err: { message: React.SetStateAction<string | null>; }) => setPdfError(err.message)} />
                      ) : pdfError ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <div className="text-center">
                            <p className="text-red-700 font-medium text-sm">{pdfError}</p>
                            <a href={lesson.resource} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline text-xs mt-2 inline-block">
                              Download directly
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                  {viewMode === "quiz" && selectedQuiz && (
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-6 border border-gray-200 min-h-[24rem]">
                      <QuizViewer quizId={selectedQuiz.id} quizTitle={selectedQuiz.title} onClose={() => setViewMode("video")} className="w-full h-full" />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200 mb-6">
                  <p className="text-gray-500">No content available for this lesson</p>
                </div>
              )}

              {/* Lesson Details */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">About This Lesson</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                  {lesson.content || "No description available"}
                </p>
              </div>
            </div>

{/* Curriculum Sidebar */}
<div className="lg:col-span-1">
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-6">
    <h3 className="font-semibold text-gray-900 text-sm mb-4">Course Curriculum</h3>
    <div className="space-y-2 max-h-screen overflow-y-auto">
      {course?.sections?.length ? (
        course.sections
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map((sec) => {
            const isExpanded = expandedSections.has(sec.id);
            const secLessons = sec.lessons?.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) || [];
            return (
              <div key={sec.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Section Header */}
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedSections);
                    isExpanded ? newExpanded.delete(sec.id) : newExpanded.add(sec.id);
                    setExpandedSections(newExpanded);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <p className="text-xs font-semibold text-gray-900 truncate">{sec.title}</p>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Expanded Lessons & Quizzes */}
                {isExpanded && (
                  <div className="pl-4 pr-2 py-2 space-y-1">
                    {/* Lessons */}
                    {secLessons.map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleLessonSelect(l, sec.id)}
                          className={`flex-1 text-left text-xs px-2 py-1 rounded hover:bg-purple-50 transition-colors ${
                            lesson.id === l.id ? "bg-purple-100 font-semibold" : "text-gray-700"
                          }`}
                        >
                          🎬 {l.title}
                        </button>
                        {/* Lesson Resource */}
                        {l.resource && (
                          <button
                            title="Open Resource"
                            onClick={() => {
                              setLesson(l);
                              loadPdf();
                              setSection(sec);
                              setViewMode("pdf");
                            }}
                            className="text-gray-500 hover:text-purple-600 text-xs px-1"
                          >
                            📄
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Section Quizzes */}
                    {sec.quizzes?.length > 0 &&
                      sec.quizzes.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            setSelectedQuiz(q);
                            setSection(sec);
                            setViewMode("quiz");
                          }}
                          className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-purple-50 transition-colors ${
                            selectedQuiz?.id === q.id ? "bg-purple-100 font-semibold" : "text-gray-700"
                          }`}
                        >
                          🎯 {q.title}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })
      ) : (
        <p className="text-gray-500 text-xs">No sections available</p>
      )}
    </div>
  </div>
</div>


          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
