"use client";

import React, { useEffect, useState, JSX, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PDFViewer } from "@/components/PDFViewer";
import { userService } from "@/services/userService";
import { courseService } from "@/services/courseService";
import { lessonService } from "@/services/lessonService";
import { Lesson, Section, Course } from "@/types/api";
import { useAuth } from "@/components/contexts/AuthContext";

type CourseDetail = Course & {
  sections?: Section[];
  instructorBio?: string;
};

export default function LessonViewerPage(): JSX.Element {
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
  const [viewMode, setViewMode] = useState<"video" | "pdf">("video");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !courseId || !sectionId) {
        return;
      }

      cancelledRef.current = false;
      setViewMode("video");
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setPdfError(null);

      try {
        const courseResponse = await courseService.getCourseById(courseId);
        if (!courseResponse.data) {
          setError("Course not found");
          setIsLoading(false);
          return;
        }

        setCourse(courseResponse.data);

        const foundSection = courseResponse.data.sections?.find(
          (s: Section) => s.id === sectionId
        );
        setSection(foundSection || null);

        const foundLesson = foundSection?.lessons?.find(
          (l: Lesson) => l.id === lessonId
        );
        setLesson(foundLesson || null);

        if (foundSection?.id) {
          setExpandedSections(new Set([foundSection.id]));
        }

        if (foundLesson?.createdBy) {
          try {
            const userResponse = await userService.getById(foundLesson.createdBy);
            if (userResponse.data) {
              setCreatorName(
                userResponse.data.name || userResponse.data.email || "Unknown"
              );
            } else {
              setCreatorName("Unknown");
            }
          } catch (err: any) {
            const status = err?.message?.includes('403') ? 403 : null;
            if (status === 403) {
              setCreatorName("Course Creator");
            } else {
              console.error("Failed to fetch creator:", err);
              setCreatorName("Unknown");
            }
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

  const handleLessonSelect = (selectedLesson: Lesson) => {
    cancelledRef.current = false;
    setViewMode("video");
    setPdfUrl(null);
    setPdfError(null);
    router.push(
      `/dashboard/student/learn/lesson/${selectedLesson.id}?courseId=${courseId}&sectionId=${sectionId}`
    );
  };

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
      if (status === 404) {
        setPdfError("PDF not available for this lesson.");
      } else {
        setPdfError(err?.message || "Failed to load lesson PDF.");
      }
      setPdfUrl(null);
    } finally {
      if (!cancelledRef.current) {
        setIsPdfLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const sortedLessons = section?.lessons
    ? [...section.lessons].sort(
        (a: Lesson, b: Lesson) => (a.orderIndex || 0) - (b.orderIndex || 0)
      )
    : [];

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-900 font-semibold mb-4">
              {error || "Lesson not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-4">
            <h1 className="text-2xl font-bold text-white">{String(lesson.title)}</h1>
            <p className="text-blue-100 text-sm mt-2">
              {String(section.title)} • {String(course.title)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 sm:p-8">
            <div className="lg:col-span-2">
              {lesson.video || lesson.resource ? (
                <>
                  {(lesson.video || lesson.resource) && (
                    <div className="flex gap-2 mb-4">
                      {lesson.video && (
                        <button
                          onClick={() => setViewMode("video")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            viewMode === "video"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 .5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h8z" />
                          </svg>
                          Video
                        </button>
                      )}
                      {lesson.resource && (
                        <button
                          onClick={loadPdf}
                          disabled={isPdfLoading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            viewMode === "pdf"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                          }`}
                        >
                          {isPdfLoading && (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a2 2 0 012-2h4a1 1 0 01.894.553l1.5 3a1 1 0 01-.894 1.447h-.5a1 1 0 00-.894.553l-.5 1a1 1 0 01-.894.553H9a1 1 0 00-.894.553l-1 2A1 1 0 007 12h-.5a1 1 0 01-.894-.553l-1-2A1 1 0 004 9V4z" clipRule="evenodd" />
                          </svg>
                          Resource
                        </button>
                      )}
                    </div>
                  )}

                  {viewMode === "video" && lesson.video && (
                    <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
                      <VideoPlayer
                        src={lesson.video}
                        className="w-full h-full object-contain"
                        autoPlay={true}
                        controls={true}
                      />
                    </div>
                  )}

                  {viewMode === "pdf" && lesson.resource && (
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-6 aspect-video border border-gray-200">
                      {pdfUrl ? (
                        <PDFViewer
                          pdfUrl={pdfUrl}
                          className="w-full h-full"
                          onError={(err) => setPdfError(err.message)}
                        />
                      ) : pdfError ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium text-sm">{pdfError}</p>
                            <a
                              href={lesson.resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 underline text-xs mt-2 inline-block"
                            >
                              Download directly
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200 mb-6">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500">No content available for this lesson</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">About This Lesson</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                  {String(lesson.content || "No description available")}
                </p>

                {lesson.createdBy && (
                  <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Created by</p>
                      <p className="font-medium text-gray-900">{creatorName}</p>
                    </div>
                  </div>
                )}

                {lesson.resource && !lesson.video && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={lesson.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Download Resource
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-6">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">
                  Course Curriculum
                </h3>

                <div className="space-y-2 max-h-screen overflow-y-auto">
                  {Array.isArray(course?.sections) && course.sections.length > 0 ? (
                    course.sections
                      .sort((a: Section, b: Section) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((sec: Section) => {
                        const isExpanded = expandedSections.has(sec.id);
                        const secLessons = Array.isArray(sec.lessons)
                          ? [...sec.lessons].sort((a: Lesson, b: Lesson) => (a.orderIndex || 0) - (b.orderIndex || 0))
                          : [];

                        return (
                          <div key={sec.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedSections);
                                if (newExpanded.has(sec.id)) {
                                  newExpanded.delete(sec.id);
                                } else {
                                  newExpanded.add(sec.id);
                                }
                                setExpandedSections(newExpanded);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {String(sec.title)}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {secLessons.length} {secLessons.length === 1 ? "lesson" : "lessons"}
                                </p>
                              </div>
                              <svg
                                className={`w-4 h-4 text-gray-600 flex-shrink-0 ml-2 transition-transform ${
                                  isExpanded ? "transform rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            </button>

                            {isExpanded && secLessons.length > 0 && (
                              <div className="border-t border-gray-200 bg-white divide-y divide-gray-100">
                                {secLessons.map((l: Lesson) => {
                                  const videoFileName = l.video ? l.video.split('/').pop() : null;
                                  const resourceFileName = l.resource ? l.resource.split('/').pop() : null;

                                  return (
                                    <button
                                      key={l.id}
                                      onClick={() => handleLessonSelect(l)}
                                      className={`w-full text-left px-3 py-2 transition-colors text-xs flex items-start gap-2 ${
                                        l.id === lesson.id
                                          ? "bg-blue-50 border-l-2 border-l-blue-600"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      {l.video ? (
                                        <svg
                                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 .5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h8z" />
                                        </svg>
                                      ) : (
                                        <svg
                                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-orange-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M8 4a2 2 0 012-2h4a1 1 0 01.894.553l1.5 3a1 1 0 01-.894 1.447h-.5a1 1 0 00-.894.553l-.5 1a1 1 0 01-.894.553H9a1 1 0 00-.894.553l-1 2A1 1 0 007 12h-.5a1 1 0 01-.894-.553l-1-2A1 1 0 004 9V4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${l.id === lesson.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                          {String(l.title)}
                                        </p>
                                        <div className="space-y-0.5 mt-1">
                                          {videoFileName && (
                                            <p className="text-xs text-blue-600 truncate" title={videoFileName}>
                                              📹 {videoFileName}
                                            </p>
                                          )}
                                          {resourceFileName && (
                                            <p className="text-xs text-orange-600 truncate" title={resourceFileName}>
                                              📄 {resourceFileName}
                                            </p>
                                          )}
                                          {l.duration && (
                                            <p className={`text-xs ${l.id === lesson.id ? 'text-blue-600' : 'text-gray-500'}`}>
                                              ⏱️ {String(l.duration)} min
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">No sections available</p>
                    </div>
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
