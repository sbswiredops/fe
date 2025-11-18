"use client";

import React, { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";

type QuestionType = "mcq" | "multi" | "true_false" | "fill_blank" | "short";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer?: string;
  explanation?: string;
}

interface QuizDetails {
  id: string;
  title: string;
  totalQuestions: number;
  totalTime: number;
  passMark: number;
  hasNegativeMark: boolean;
  negativeMarkPercentage?: number;
}

interface QuizViewerProps {
  quizId: string;
  quizTitle: string;
  onClose?: () => void;
  className?: string;
}

export const QuizViewer: React.FC<QuizViewerProps> = ({
  quizId,
  quizTitle,
  onClose,
  className = "w-full h-full",
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detailsResponse = await quizService.getById(quizId);
        if (detailsResponse.data) {
          setQuizDetails(detailsResponse.data);
        }

        const questionsResponse = await quizService.getQuestions(quizId);
        if (questionsResponse.data) {
          setQuestions(Array.isArray(questionsResponse.data) ? questionsResponse.data : []);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

  if (isLoading) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-50`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-50`}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-2"
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
          <p className="text-red-700 font-medium text-sm mb-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!hasStarted && quizDetails) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{quizTitle}</h2>
            <p className="text-gray-600 text-sm">Get ready to test your knowledge</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">প্রশ্ন সংখ্যা</p>
                <p className="font-bold text-gray-900">{quizDetails.totalQuestions}টি</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">মোট সময়</p>
                <p className="font-bold text-gray-900">{quizDetails.totalTime} মিনিট</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">পাস মার্ক</p>
                <p className="font-bold text-gray-900">{quizDetails.passMark}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${quizDetails.hasNegativeMark ? 'bg-red-100' : 'bg-green-100'}`}>
                <svg className={`w-6 h-6 ${quizDetails.hasNegativeMark ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  {quizDetails.hasNegativeMark ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">নেগেটিভ মার্কিং</p>
                <p className="font-bold text-gray-900">{quizDetails.hasNegativeMark ? 'আছে' : 'নেই'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            কুইজ শুরু করুন
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              বাতিল করুন
            </button>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-50`}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-2"
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
          <p className="text-red-700 font-medium text-sm mb-2">
            No questions found
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const toggleMultiSelect = (optionId: string) => {
    const prev = answers[currentQuestion.id] || [];
    if (prev.includes(optionId)) {
      handleAnswer(prev.filter((id: string) => id !== optionId));
    } else {
      handleAnswer([...prev, optionId]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;
    alert(
      `Quiz submitted! You answered ${answeredCount} out of ${totalCount} questions.`
    );
    if (onClose) onClose();
  };

  return (
    <div className={`${className} bg-white flex flex-col overflow-hidden`}>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{quizTitle}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-purple-800 p-1 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-4 bg-purple-500 h-2 rounded-full">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-blue-100 text-sm mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.text}
        </h4>
        {/* ================== MCQ ================== */}
        {currentQuestion.type === "mcq" && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                style={{
                  borderColor:
                    answers[currentQuestion.id] === option.id
                      ? "#2563eb"
                      : "#e5e7eb",
                  backgroundColor:
                    answers[currentQuestion.id] === option.id
                      ? "#eff6ff"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => handleAnswer(option.id)}
                  className="w-4 h-4 accent-purple-600"
                />
                <span className="ml-3 text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {/* ================== MULTI SELECT ================== */}
        {currentQuestion.type === "multi" && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] || [];
              return (
                <label
                  key={option.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                  style={{
                    borderColor: selected.includes(option.id)
                      ? "#2563eb"
                      : "#e5e7eb",
                    backgroundColor: selected.includes(option.id)
                      ? "#eff6ff"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    onChange={() => toggleMultiSelect(option.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="ml-3 text-gray-700">{option.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* ================== TRUE / FALSE ================== */}
        {currentQuestion.type === "true_false" && (
          <div className="space-y-3">
            {["true", "false"].map((val) => (
              <label
                key={val}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                style={{
                  borderColor:
                    answers[currentQuestion.id] === val ? "#2563eb" : "#e5e7eb",
                  backgroundColor:
                    answers[currentQuestion.id] === val
                      ? "#eff6ff"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={val}
                  checked={answers[currentQuestion.id] === val}
                  onChange={() => handleAnswer(val)}
                  className="w-4 h-4 accent-purple-600"
                />
                <span className="ml-3 text-gray-700">{val.toUpperCase()}</span>
              </label>
            ))}
          </div>
        )}

        {/* ================== FILL IN THE BLANK ================== */}
        {currentQuestion.type === "fill_blank" && (
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Type your answer..."
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}

        {/* ================== SHORT ANSWER ================== */}
        {currentQuestion.type === "short" && (
          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Write your answer..."
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            rows={4}
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t p-6 flex justify-between bg-gray-50">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors
    ${
      currentQuestionIndex === 0
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
    }
  `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, idx) => {
            const isAnswered = answers[questions[idx].id];
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-lg ${
                  idx === currentQuestionIndex
                    ? "bg-purple-600 text-white"
                    : isAnswered
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizViewer;
