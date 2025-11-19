/* eslint-disable @next/next/no-img-element */
"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { API_CONFIG } from "@/lib/config";

interface QuizQuestion {
  id: string;
  text: string;
  type: "mcq" | "multi" | "true_false" | "fill_blank" | "short";
  options?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer?: string | string[];
  explanation?: string;
}

interface QuizAnswer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
}

interface QuizResultData {
  id: string;
  quizId: string;
  quizTitle: string;
  courseName?: string;
  submittedAt: string;
  totalScore: number;
  maxScore: number;
  passingScore: number;
  isPassed: boolean;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  timeSpent?: number;
}

function QuestionReview({
  question,
  answer,
}: {
  question: QuizQuestion;
  answer: QuizAnswer;
}): JSX.Element {
  const getUserAnswerText = () => {
    if (!answer.userAnswer && answer.userAnswer !== false) return "Not answered";

    if (question.type === "true_false") {
      return answer.userAnswer === "true" || answer.userAnswer === true
        ? "True"
        : "False";
    }

    if (question.type === "mcq" || question.type === "multi") {
      const selectedIds = Array.isArray(answer.userAnswer)
        ? answer.userAnswer
        : [answer.userAnswer];

      return question.options
        ?.filter((opt) => selectedIds.includes(opt.id))
        .map((opt) => opt.text)
        .join(", ");
    }

    return String(answer.userAnswer);
  };

  const getCorrectAnswerText = () => {
    if (question.type === "true_false") {
      return question.correctAnswer === "true" ||
        question.correctAnswer === true
        ? "True"
        : "False";
    }

    if (question.type === "mcq" || question.type === "multi") {
      const correctIds = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];

      return question.options
        ?.filter((opt) => correctIds.includes(opt.id))
        .map((opt) => opt.text)
        .join(", ");
    }

    return String(question.correctAnswer);
  };

  const userAnswerText = getUserAnswerText();
  const correctAnswerText = getCorrectAnswerText();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {String(question.text)}
          </h4>
        </div>
        <div
          className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
            answer.isCorrect ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {answer.isCorrect ? "✓" : "✗"}
        </div>
      </div>

      {/* Score */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 font-medium">
          Points: <span className="text-gray-900 font-bold">{answer.points}/{answer.maxPoints}</span>
        </p>
      </div>

      {/* User's Answer */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 font-medium mb-2">Your Answer:</p>
        <div
          className={`p-3 rounded-lg border-l-4 ${
            answer.isCorrect
              ? "bg-green-50 border-l-green-500 text-green-800"
              : "bg-red-50 border-l-red-500 text-red-800"
          }`}
        >
          <p className="text-sm font-medium">
            {userAnswerText === "Not answered" ? (
              <span className="italic text-gray-600">Not answered</span>
            ) : (
              userAnswerText
            )}
          </p>
        </div>
      </div>

      {/* Correct Answer (if wrong) */}
      {!answer.isCorrect && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Correct Answer:
          </p>
          <div className="p-3 rounded-lg border-l-4 border-l-green-500 bg-green-50">
            <p className="text-sm font-medium text-green-800">{correctAnswerText}</p>
          </div>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-medium mb-1">💡 Explanation:</p>
          <p className="text-xs text-blue-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: QuizResultData }): JSX.Element {
  // Safety check for undefined data
  if (!result) {
    return <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-600">Result data unavailable</div>;
  }

  const scorePercentage = result.maxScore ? (result.totalScore / result.maxScore) * 100 : 0;
  const submittedDate = new Date(result.submittedAt);
  const formattedDate = submittedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const correctCount = (result.answers || []).filter((a) => a.isCorrect).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
      {/* Header */}
      <div
        className={`px-6 py-4 ${
          result?.isPassed
            ? "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200"
            : "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {String(result?.quizTitle || "Quiz")}
            </h3>
            {result?.courseName && (
              <p className="text-sm text-gray-600">{result.courseName}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
          </div>
          <div
            className={`text-right py-2 px-4 rounded-lg font-bold ${
              result?.isPassed
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {result?.isPassed ? "✓ PASSED" : "✗ FAILED"}
          </div>
        </div>

        {/* Score Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Score: {result?.totalScore || 0}/{result?.maxScore || 0}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {scorePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                result?.isPassed ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(scorePercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Passing Score: {result?.passingScore || 0}%</span>
            <span>Correct: {correctCount}/{(result?.questions || []).length}</span>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Question Review</h4>
        {(result.questions && result.questions.length > 0) ? (
          (result.questions || []).map((question, index) => {
            const answer = (result.answers || []).find(
              (a) => a.questionId === question.id
            );
            return (
              <div key={question.id} className="mb-4">
                <p className="text-xs text-gray-500 font-semibold mb-2">
                  Question {index + 1}
                </p>
                {answer && (
                  <QuestionReview question={question} answer={answer} />
                )}
              </div>
            );
          })
        ) : (
          <p className="text-gray-600 text-sm">No questions available for review</p>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const quizId = searchParams.get("quizId");
  const resultId = searchParams.get("resultId");

  const [results, setResults] = useState<QuizResultData[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuizResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<"all" | "passed" | "failed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authLoading || !userId) {
      return;
    }

    let isMounted = true;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch quiz results - this endpoint may need to be adjusted based on backend
        const endpoint = resultId
          ? `${API_CONFIG.ENDPOINTS.QUIZZES}/${resultId}`
          : `${API_CONFIG.ENDPOINTS.QUIZZES}`;

        const response = await apiClient.get<any>(endpoint, {
          userId,
          ...(quizId && { quizId }),
        });

        if (isMounted) {
          const resultsList = Array.isArray(response?.data)
            ? response.data
            : response?.data?.results || [];

          setResults(resultsList);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching quiz results:", err);
          // For demo purposes, set empty results
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [userId, authLoading, quizId, resultId]);

  // Filter results
  useEffect(() => {
    let filtered = results || [];

    // Filter by status
    if (filterBy === "passed") {
      filtered = filtered.filter((r) => r?.isPassed);
    } else if (filterBy === "failed") {
      filtered = filtered.filter((r) => !r?.isPassed);
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r?.quizTitle || "").toLowerCase().includes(search) ||
          (r?.courseName && r.courseName.toLowerCase().includes(search))
      );
    }

    setFilteredResults(filtered);
  }, [results, filterBy, searchTerm]);

  // Calculate statistics
  const stats = {
    totalAttempts: results.length,
    passed: (results || []).filter((r) => r.isPassed).length,
    failed: (results || []).filter((r) => !r.isPassed).length,
    averageScore:
      (results || []).length > 0
        ? (
            (results || []).reduce((sum, r) => sum + (r.totalScore && r.maxScore ? (r.totalScore / r.maxScore) * 100 : 0), 0) /
            (results || []).length
          ).toFixed(1)
        : 0,
  };

  if (authLoading || (loading && results.length === 0)) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quiz results...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600">
            Review your quiz attempts and track your progress
          </p>
        </div>

        {/* Stats Section */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 mb-1">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAttempts}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 mb-1">Passed</p>
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 mb-1">Avg Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.averageScore}%
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 ? (
          <>
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by quiz or course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  {(["all", "passed", "failed"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterBy(filter)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        filterBy === filter
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter === "all" ? "All" : filter === "passed" ? "Passed" : "Failed"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results List */}
            {filteredResults.length > 0 ? (
              <div>
                {filteredResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              No Quiz Results Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete some quizzes to see your results and track your progress!
            </p>
            <button
              onClick={() => router.push("/dashboard/student/courses")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Take a Quiz
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
