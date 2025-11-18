"use client";

import React, { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";

interface Question {
  id: string;
  text: string;
  type: string;
  options?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer?: string;
  explanation?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await quizService.getQuestions(quizId);
        if (response.data) {
          setQuestions(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load quiz questions");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50`}>
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 font-medium text-sm mb-2">{error || "No questions found"}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (optionId: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
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
    alert(`Quiz submitted! You answered ${answeredCount} out of ${totalCount} questions.`);
    if (onClose) onClose();
  };

  return (
    <div className={`${className} bg-white flex flex-col overflow-hidden`}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{quizTitle}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 p-1 rounded transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4 bg-blue-500 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-blue-100 text-sm mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">
            {currentQuestion.text}
          </h4>

          {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: answers[currentQuestion.id] === option.id ? "#2563eb" : "#e5e7eb",
                    backgroundColor: answers[currentQuestion.id] === option.id ? "#eff6ff" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => handleAnswer(option.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "true_false" && (
            <div className="space-y-3">
              {[
                { id: "true", text: "True" },
                { id: "false", text: "False" },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: answers[currentQuestion.id] === option.id ? "#2563eb" : "#e5e7eb",
                    backgroundColor: answers[currentQuestion.id] === option.id ? "#eff6ff" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => handleAnswer(option.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "short_answer" && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          )}

          {currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 p-6 flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 rounded-lg font-medium transition-colors text-sm ${
                idx === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : answers[questions[idx].id]
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizViewer;
