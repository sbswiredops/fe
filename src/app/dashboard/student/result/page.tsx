"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import { Check, Dot, ChevronDown, ChevronUp } from "lucide-react";

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
  userAnswer: string | string[] | boolean | null;
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
  answers: Record<string, any>; // Changed from QuizAnswer[] to Record
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
  // Parse correct answer
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

  // Get correct option IDs
  const correctOptionIds = question.options
    ?.filter(opt => {
      if (question.type === "multi" || question.type === "mcq") {
        return correctTexts.includes(opt.text);
      }
      return opt.isCorrect;
    })
    .map(opt => opt.id) || [];

  // Get user selected IDs
  const userAnswer = answer?.userAnswer;
  const selectedIds = userAnswer 
    ? Array.isArray(userAnswer) 
      ? userAnswer 
      : [userAnswer]
    : [];

  // Find user selected options
  const selectedOptions = question.options?.filter(opt => 
    selectedIds.some(id => id === opt.id || id === opt.text)
  ) || [];

  // Check if answer is correct
  const isCorrect = answer?.isCorrect || false;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      {/* Question Text */}
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-base flex-1">
          {question.text}
        </h4>
        <span className="text-sm font-medium text-gray-600 ml-2">
          {question.mark ? `${question.mark} points` : "1 point"}
        </span>
      </div>

      {/* Options List */}
      {question.options && question.options.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-medium mb-3">Options:</p>
          <ul className="space-y-2">
            {question.options
              .filter((opt, index, self) => 
                index === self.findIndex(o => o.text === opt.text)
              )
              .map((opt) => {
                const isCorrectOption = correctOptionIds.includes(opt.id);
                const isUserSelected = selectedOptions.some(so => so.text === opt.text);
                
                return (
                  <li
                    key={opt.id}
                    className={`px-4 py-3 rounded-lg border flex items-start gap-3 transition-colors
                      ${isCorrectOption 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-300"
                      }
                      ${isUserSelected && !isCorrectOption 
                        ? "bg-red-50 border-red-400" 
                        : ""
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrectOption && (
                        <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      {isUserSelected && !isCorrectOption && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                          <Dot className="w-4 h-4" />
                        </div>
                      )}
                      {!isCorrectOption && !isUserSelected && (
                        <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"></div>
                      )}
                    </div>
                    <span className={`text-base ${isCorrectOption ? "text-green-800 font-medium" : "text-gray-800"}`}>
                      {opt.text}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {/* User's Answer */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-medium mb-2">Your Answer:</p>
        <div
          className={`p-4 rounded-lg border-l-4 ${
            isCorrect
              ? "bg-green-50 border-l-green-500"
              : "bg-red-50 border-l-red-500"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isCorrect ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Correct</span>
              </>
            ) : (
              <>
                <Dot className="w-4 h-4 text-red-600" />
                <span className="text-red-700 font-medium">Incorrect</span>
              </>
            )}
          </div>
          <p className="text-gray-800">
            {!userAnswer 
              ? "Not answered"
              : question.type === "true_false"
              ? userAnswer === true || userAnswer === "true" ? "True" : "False"
              : Array.isArray(userAnswer)
              ? selectedOptions.map(opt => opt.text).join(", ") || String(userAnswer)
              : selectedOptions.map(opt => opt.text).join(", ") || String(userAnswer)
            }
          </p>
          {answer && (
            <p className="text-sm text-gray-600 mt-2">
              Score: {answer.points}/{answer.maxPoints}
            </p>
          )}
        </div>
      </div>

      {/* Correct Answer if wrong */}
      {!isCorrect && correctTexts.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-medium mb-2">Correct Answer:</p>
          <div className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50">
            <p className="text-green-800 font-medium">
              {correctTexts.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">💡</span>
            <p className="text-sm text-blue-800 font-medium">Explanation:</p>
          </div>
          <p className="text-sm text-blue-700">{question.explanation}</p>
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

  const questions: QuizQuestion[] = Array.isArray(result.questions)
    ? result.questions
    : [];
  
  // Transform answers from Record to QuizAnswer[]
  const answersObj: Record<string, any> = result.answers || {};
  const answers: QuizAnswer[] = questions.map((q) => {
    const userAnswer = answersObj[q.id];
    let isCorrect = false;
    let points = 0;
    const maxPoints = q.mark || 1;

    // Check correctness based on question type
    if (userAnswer !== undefined && userAnswer !== null) {
      if (q.type === "multi") {
        // multi: userAnswer is array of option ids
        let correctTexts: string[] = [];
        try {
          correctTexts = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : typeof q.correctAnswer === 'string'
            ? JSON.parse(q.correctAnswer)
            : [];
        } catch {
          correctTexts = [];
        }

        // Get user selected texts
        const userSelectedIds = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const userSelectedTexts = q.options
          ?.filter(opt => userSelectedIds.includes(opt.id))
          .map(opt => opt.text) || [];

        // Check if all correct texts are selected and no extra ones
        const correctSet = new Set(correctTexts);
        const userSet = new Set(userSelectedTexts);
        
        isCorrect = 
          correctTexts.length === userSelectedTexts.length &&
          correctTexts.every(text => userSelectedTexts.includes(text));
        
      } else if (q.type === "mcq" || q.type === "true_false") {
        // For MCQ and True/False
        const correctOption = q.options?.find(opt => opt.isCorrect);
        if (correctOption) {
          if (q.type === "true_false") {
            // For true/false, compare boolean or string
            const correctValue = correctOption.text === "True";
            isCorrect = 
              (userAnswer === true && correctValue) || 
              (userAnswer === false && !correctValue) ||
              (userAnswer === "true" && correctValue) ||
              (userAnswer === "false" && !correctValue);
          } else {
            // For MCQ, compare option id
            isCorrect = userAnswer === correctOption.id;
          }
        }
      } else {
        // For fill_blank and short answer
        const correctAnswer = String(q.correctAnswer || "").trim().toLowerCase();
        const userAns = String(userAnswer).trim().toLowerCase();
        isCorrect = correctAnswer === userAns;
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
  const timeSpentMinutes = result.timeSpent ? Math.ceil(result.timeSpent / 60) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm mb-6">
      {/* Header */}
      <div
        className={`px-6 py-5 ${
          result.isPassed
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200"
            : "bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {result.quizTitle}
              </h3>
              {result.isFinalQuiz && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  Final Quiz
                </span>
              )}
            </div>
            
            {result.courseName && (
              <p className="text-sm text-gray-700 mb-2">
                Course: <span className="font-medium">{result.courseName}</span>
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>📅 {formattedDate}</span>
              {result.timeSpent && (
                <span>⏱️ {timeSpentMinutes} min</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div
              className={`py-2 px-4 rounded-lg font-bold text-center mb-2 ${
                result.isPassed
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {result.isPassed ? "PASSED" : "FAILED"}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {result.totalScore}/{result.maxScore}
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {scorePercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Score Breakdown
            </span>
            <span className="text-sm font-medium text-gray-700">
              Correct: {correctCount}/{questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                result.isPassed ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(scorePercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Passing Score: {result.passingScore}</span>
            <span className={scorePercentage >= result.passingScore ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {scorePercentage >= result.passingScore ? "✓ Above Passing" : "✗ Below Passing"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Expandable Details */}
      {showDetails && questions.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-gray-900">
              Question Review ({questions.length} questions)
            </h4>
            <div className="text-sm text-gray-600">
              Total Points: {result.totalScore}/{result.maxScore}
            </div>
          </div>
          
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const answer = answers.find((a) => a.questionId === q.id);
              return (
                <div key={`${result.id}-${q.id}`} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${answer?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {idx + 1}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {q.type === "mcq" ? "Multiple Choice" : 
                       q.type === "multi" ? "Multiple Select" : 
                       q.type === "true_false" ? "True/False" : 
                       q.type === "fill_blank" ? "Fill in Blank" : 
                       "Short Answer"}
                    </span>
                  </div>
                  <QuestionReview question={q} answer={answer} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Toggle Button */}
      {questions.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => {/* Will be handled by parent */}}
            className="w-full px-6 py-4 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="font-medium">Hide Details</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="font-medium">Show Question Details</span>
              </>
            )}
          </button>
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

        console.log("Quiz Results API Response:", response);
        
        if (!isMounted) return;

        // Handle different response structures
        const responseData = response?.data;
        
        if (responseData?.success === true && Array.isArray(responseData?.data)) {
          // Structure: { success: true, data: [], message: "..." }
          setResults(responseData.data);
        } else if (Array.isArray(responseData)) {
          // Structure: directly an array
          setResults(responseData);
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          // Structure: { data: [] }
          setResults(responseData.data);
        } else if (responseData?.message === "No final quiz result yet.") {
          setResults([]);
        } else if (responseData?.data) {
          // Single result object
          setResults([responseData.data]);
        } else {
          setResults([]);
          console.warn("Unexpected API response structure:", responseData);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Error fetching quiz results:", err);
        
        if (err?.response?.status === 404) {
          setResults([]);
          setError(null);
        } else if (err?.response?.status === 401) {
          setError("Please login to view your results");
        } else {
          setError(err?.message || "Failed to fetch quiz results. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuizResults();

    return () => {
      isMounted = false;
    };
  }, [userId, authLoading]);

  // Loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your quiz results...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Final Quiz Results
          </h1>
          <p className="text-gray-600">
            Review your performance and learn from your mistakes
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                !
              </div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Quiz Attempts ({results.length})
              </h2>
              <div className="text-sm text-gray-600">
                Sorted by most recent
              </div>
            </div>
            
            <div className="space-y-6">
              {results.map((result, idx) => (
                <div key={result.id} onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)} className="cursor-pointer">
                  <ResultCard
                    result={result}
                    showDetails={expandedIndex === idx}
                  />
                </div>
              ))}
            </div>
            
            {/* Stats Summary */}
            <div className="mt-10 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {results.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {results.filter(r => r.isPassed).length}
                  </div>
                  <div className="text-sm text-gray-600">Passed Quizzes</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {results.reduce((acc, r) => acc + r.totalScore, 0)}/
                    {results.reduce((acc, r) => acc + r.maxScore, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No Results State
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-300 p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Quiz Results Yet
              </h3>
              <p className="text-gray-600 mb-8">
                You haven't attempted any final quizzes yet. Complete a quiz to see your results and track your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/dashboard/student/courses")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  Browse Courses
                </button>
                <button
                  onClick={() => router.push("/dashboard/student/quizzes")}
                  className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors border border-gray-300 inline-flex items-center justify-center gap-2"
                >
                  View All Quizzes
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Need help? Contact your instructor for quiz access.
              </p>
            </div>
          </div>
        )}

        {/* Footer Help Text */}
        {results.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              💡 Tip: Review incorrect answers to improve your understanding
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}