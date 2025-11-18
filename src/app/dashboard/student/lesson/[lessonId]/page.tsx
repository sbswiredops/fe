"use client";

import React, { useEffect, useState, JSX } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { userService } from "@/services/userService";
import { courseService } from "@/services/courseService";
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

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !courseId || !sectionId) {
        return;
      }

      try {
        const courseResponse = await courseService.getById(courseId);
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

        if (foundLesson?.createdBy) {
          try {
            const userResponse = await userService.getById(foundLesson.createdBy);
            if (userResponse.data) {
              setCreatorName(
                userResponse.data.name || userResponse.data.email || "Unknown"
              );
            }
          } catch (err) {
            console.error("Failed to fetch creator:", err);
            setCreatorName("Unknown");
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
    router.push(
      `/dashboard/student/lesson/${selectedLesson.id}?courseId=${courseId}&sectionId=${sectionId}`
    );
  };

  const sortedLessons = section?.lessons
    ? [...section.lessons].sort(
        (a: Lesson, b: Lesson) => (a.orderIndex || 0) - (b.orderIndex || 0)
      )
    : [];

  if (isAuthChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson || !section || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
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
          <p className="text-gray-900 font-semibold mb-2">
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
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="flex h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{String(lesson.title)}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {String(section.title)} • {String(course.title)}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col overflow-hidden">
            {lesson.video && (
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                <video
                  src={lesson.video}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  autoPlay
                />
              </div>
            )}

            {lesson.resource && !lesson.video && (
              <div className="flex-1 bg-gray-800 flex items-center justify-center">
                <iframe
                  src={lesson.resource}
                  className="w-full h-full border-none"
                />
              </div>
            )}

            {!lesson.video && !lesson.resource && (
              <div className="flex-1 bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 text-gray-500"
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
                  <p className="text-gray-400">No content available</p>
                </div>
              </div>
            )}

            <div className="bg-gray-800 border-t border-gray-700 p-6 max-h-48 overflow-y-auto">
              <h3 className="font-semibold text-white mb-3">বিবরণ</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {String(lesson.content || "No description available")}
              </p>
              {lesson.createdBy && (
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>দ্বারা {creatorName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white text-sm">
                {String(section.title)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {sortedLessons.length} পাঠ
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sortedLessons.map((l: Lesson) => (
                <button
                  key={l.id}
                  onClick={() => handleLessonSelect(l)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition-colors text-sm ${
                    l.id === lesson.id
                      ? "bg-blue-600 border-l-4 border-l-blue-400"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {l.video ? (
                      <svg
                        className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 .5a.5.5 0 01.5.5v5a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V7a.5.5 0 01.5-.5h8z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5"
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
                      <p className="font-medium text-white text-xs truncate">
                        {String(l.title)}
                      </p>
                      {l.duration && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {String(l.duration)} মিনিট
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
