"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import { Check, Dot } from "lucide-react";

// ---------------- Types ----------------
interface QuizQuestion {
  id: string;
  text: string;
  type: "mcq" | "multi" | "true_false" | "fill_blank" | "short";
  options?: Array<{ id: string; text: string; isCorrect?: boolean }>;
  correctAnswer?: string | string[];
  explanation?: string;
  mark?: number;
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
  isFinalQuiz?: boolean;
}

// ---------------- Question Review ----------------
function QuestionReview({
  question,
  answer,
}: {
  question: QuizQuestion;
  answer?: QuizAnswer;
}): JSX.Element {
  // Parse correct answer for multi if it's a JSON string of texts
  let correctTexts: string[] = [];
  if (question.type === "multi" && typeof question.correctAnswer === "string") {
    try {
      correctTexts = JSON.parse(question.correctAnswer);
    } catch {
      correctTexts = [];
    }
  } else if (Array.isArray(question.correctAnswer)) {
    correctTexts = question.correctAnswer;
  } else if (typeof question.correctAnswer === "string") {
    correctTexts = [question.correctAnswer];
  }

  // User selected ids
  const selectedIds = answer
    ? Array.isArray(answer.userAnswer)
      ? answer.userAnswer
      : answer.userAnswer
      ? [answer.userAnswer]
      : []
    : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      {/* Question Text */}
      <h4 className="font-semibold text-gray-900 text-base mb-2">
        {question.text}
      </h4>

      {/* Options List */}
      {question.options && question.options.length > 0 && (
        <ul className="mb-4 space-y-2">
          {[
            ...new Map(question.options.map((opt) => [opt.text, opt])).values(),
          ].map((opt) => {
            // Always match correct by text for mcq, multi, true_false
            const isCorrect = correctTexts.includes(opt.text);
            const isSelected = selectedIds.includes(opt.id);
            return (
              <li
                key={opt.text}
                className={`px-3 py-2 rounded border flex items-center gap-2
                    ${
                      isCorrect
                        ? "border-green-500 bg-green-50 font-semibold"
                        : "border-gray-300"
                    }
                    ${
                      isSelected && !isCorrect
                        ? "bg-purple-50 border-purple-400"
                        : ""
                    }
                  `}
              >
                {isCorrect && (
                  <span className=" w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mr-1">
                    <Check className="w-4 h-4" />
                  </span>
                )}
                {isSelected && !isCorrect && (
                  <span className=" w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-1">
                    <Dot className="w-4 h-4" />
                  </span>
                )}
                <span className="text-base text-gray-900">{opt.text}</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* User's Answer */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 font-medium mb-2">Your Answer:</p>
        <div
          className={`p-3 rounded-lg border-l-4 ${
            answer?.isCorrect
              ? "bg-green-50 border-l-green-500 text-green-800"
              : "bg-red-50 border-l-red-500 text-red-800"
          }`}
        >
          <p className="text-sm font-medium">
            {!answer
              ? "Not answered"
              : answer.userAnswer === undefined || answer.userAnswer === null
              ? "Not answered"
              : question.type === "true_false"
              ? answer.userAnswer === "true" || answer.userAnswer === true
                ? "True"
                : "False"
              : question.options
              ? question.options
                  .filter((opt) => selectedIds.includes(opt.id))
                  .map((opt) => opt.text)
                  .join(", ") || "Not answered"
              : String(answer.userAnswer)}
          </p>
        </div>
      </div>

      {/* Correct Answer if wrong */}
      {answer && !answer.isCorrect && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Correct Answer:
          </p>
          <div className="p-3 rounded-lg border-l-4 border-l-green-500 bg-green-50">
            <p className="text-sm font-medium text-green-800">
              {question.options
                ? question.options
                    .filter((opt) =>
                      question.type === "multi"
                        ? correctTexts.includes(opt.text)
                        : correctTexts.includes(opt.id)
                    )
                    .map((opt) => opt.text)
                    .join(", ") || "Not available"
                : String(question.correctAnswer)}
            </p>
          </div>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-medium mb-1">
            💡 Explanation:
          </p>
          <p className="text-xs text-blue-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ---------------- Result Card ----------------
function ResultCard({
  result,
  showDetails = false,
}: {
  result: QuizResultData;
  showDetails?: boolean;
}): JSX.Element {
  if (!result) return <div>Result data unavailable</div>;

  // Always default questions to an array (fix for undefined error)
  const questions: QuizQuestion[] = Array.isArray(result.questions)
    ? result.questions
    : [];
  // Explicitly type answersObj to fix TS error
  const answersObj: Record<string, any> = result.answers || {};
  const answers: QuizAnswer[] = questions.map((q) => {
    const userAnswer = answersObj[q.id];
    let isCorrect = false;
    let points = 0;
    const maxPoints = q.mark || 1;

    // Check correctness (simple logic, adjust as needed)
    if (userAnswer !== undefined && userAnswer !== null) {
      if (q.type === "multi") {
        try {
          const correct = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : JSON.parse(q.correctAnswer as string);
          isCorrect =
            Array.isArray(userAnswer) &&
            correct.length === userAnswer.length &&
            correct.every((v: any) => userAnswer.includes(v));
        } catch {
          isCorrect = false;
        }
      } else if (q.type === "mcq" || q.type === "true_false") {
        isCorrect =
          q.options?.find((opt) => opt.id === userAnswer)?.isCorrect ||
          q.correctAnswer === userAnswer ||
          String(q.correctAnswer).toLowerCase() ===
            String(userAnswer).toLowerCase();
      } else {
        isCorrect =
          String(q.correctAnswer).trim().toLowerCase() ===
          String(userAnswer).trim().toLowerCase();
      }
      points = isCorrect ? maxPoints : 0;
    }

    return {
      questionId: q.id,
      userAnswer,
      isCorrect,
      points,
      maxPoints,
    };
  });

  const scorePercentage = result.maxScore
    ? (result.totalScore / result.maxScore) * 100
    : 0;
  const submittedDate = new Date(result.submittedAt);
  const formattedDate = isNaN(submittedDate.getTime())
    ? "N/A"
    : submittedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const correctCount = answers.filter((a) => a.isCorrect).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className={`px-6 py-4 ${
          result.isPassed
            ? "bg-green-50 border-b border-green-200"
            : "bg-red-50 border-b border-red-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {result.quizTitle}
            </h3>
            {result.courseName && (
              <p className="text-sm text-gray-600">{result.courseName}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
          </div>
          <div
            className={`text-right py-2 px-4 rounded-lg font-bold ${
              result.isPassed
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {result.isPassed ? "✓ PASSED" : "✗ FAILED"}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Score: {result.totalScore}/{result.maxScore}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {scorePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                result.isPassed ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(scorePercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Passing Score: {result.passingScore}</span>
            <span>
              Correct: {correctCount}/{questions.length}
            </span>
          </div>
        </div>
      </div>
      {/* Expandable Details */}
      {showDetails && (
        <div className="p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Question Review
          </h4>
          {questions.length ? (
            questions.map((q, idx) => {
              const answer = answers.find((a) => a.questionId === q.id);
              return (
                <div key={`${result.id}-${q.id}`} className="mb-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    Question {idx + 1}
                  </p>
                  <QuestionReview question={q} answer={answer} />
                </div>
              );
            })
          ) : (
            <p className="text-gray-600 text-sm">
              No questions available for review
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------- Results Page ----------------
export default function ResultsPage(): JSX.Element {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const [results, setResults] = useState<QuizResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;

    let isMounted = true;

    const fetchQuizResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<any>(
          `${API_CONFIG.ENDPOINTS.QUIZZES}/my-final-result`
        );

        if (!isMounted) return;

        // If array, set results
        if (Array.isArray(response?.data?.data)) {
          setResults(response.data.data);
        } else if (
          response?.data &&
          response.data.message === "No final quiz result yet."
        ) {
          setResults([]);
        } else if (response?.data) {
          setResults([response.data]);
        } else {
          setResults([]);
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.response?.status === 404) {
          setResults([]);
          setError(null);
        } else {
          setResults([]);
          setError("Failed to fetch your quiz results.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuizResults();

    return () => {
      isMounted = false;
    };
  }, [userId, authLoading]);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your quiz results...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Final Quiz Results
        </h1>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        {results.length ? (
          <div>
            {results.map((result, idx) => (
              <div key={result.id} className="mb-4">
                <div
                  className={`cursor-pointer transition-all ${
                    expandedIndex === idx ? "shadow-lg" : "shadow-sm"
                  }`}
                  onClick={() =>
                    setExpandedIndex(expandedIndex === idx ? null : idx)
                  }
                >
                  <ResultCard
                    result={result}
                    showDetails={expandedIndex === idx}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              No Final Quiz Result Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You have not attempted any final quiz yet.
            </p>
            <button
              onClick={() => router.push("/dashboard/student/courses")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Take a Quiz
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
