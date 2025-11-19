"use client";

import React, { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";

type QuestionType = "mcq" | "multi" | "true_false" | "fill_blank" | "short";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Array<{ id: string; text: string }>;
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

interface QuizResultResponse {
  initialScore: number;
  autoGradableQuestions: number;
  pendingManualCheck: number;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponse | null>(null);

  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch quiz details
        const detailsResponse = await quizService.getById(quizId);
        if (detailsResponse.data) {
          const quiz = detailsResponse.data;
          setQuizDetails({
            id: quiz.id, // remove quiz._id
            title: quiz.title,
            totalQuestions: quiz.questions?.length || 0,
            totalTime: quiz.timeLimit || 0,
            passMark: quiz.passingScore || 0,
            hasNegativeMark: false,
            negativeMarkPercentage: 0,
          });
        }

        // Fetch questions
        const questionsResponse = await quizService.getQuestions(quizId);
        if (questionsResponse.data) {
          const mappedQuestions: Question[] = questionsResponse.data.map(
            (q: any, idx: number) => ({
              id: q.id || q._id || q.questionId || idx.toString(),
              text: q.text,
              type: q.type,
              options: q.options?.map((opt: any, oidx: number) => ({
                id: opt.value || opt.text || oidx.toString(),
                text: opt.text,
              })),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })
          );
          setQuestions(mappedQuestions);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

  const handleAnswer = (value: any) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: value,
    });
  };

  const toggleMultiSelect = (optionId: string) => {
    const prev = answers[questions[currentQuestionIndex].id] || [];
    if (prev.includes(optionId)) {
      handleAnswer(prev.filter((id: string) => id !== optionId));
    } else {
      handleAnswer([...prev, optionId]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await quizService.submitQuiz(quizId, answers);
      if (response.data) setResult(response.data);
    } catch (err: any) {
      alert(err?.message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= Loading & Error =================
  if (isLoading)
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

  if (error)
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-50`}
      >
        <div className="text-center text-red-700 font-medium">{error}</div>
      </div>
    );

  if (!hasStarted && quizDetails)
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{quizTitle}</h2>
          <p className="text-gray-600 text-sm">
            Get ready to test your knowledge
          </p>
          <button
            onClick={() => setHasStarted(true)}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            Start Quiz
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );

  if (questions.length === 0)
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-50`}
      >
        <p className="text-red-700 font-medium text-sm">No questions found</p>
      </div>
    );

  if (result)
    return (
      <div
        className={`${className} flex flex-col items-center justify-center p-6`}
      >
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Quiz Result</h3>
          <p>
            Score: <span className="font-bold">{result.initialScore}</span>
          </p>
          <p>
            Auto-graded:{" "}
            <span className="font-bold">{result.autoGradableQuestions}</span>
          </p>
          <p>
            Pending manual check:{" "}
            <span className="font-bold">{result.pendingManualCheck}</span>
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // ================= Quiz UI =================
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
              ×
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

        {/* MCQ */}
        {currentQuestion.type === "mcq" &&
          currentQuestion.options?.map((option) => (
            <label
              key={option.id}
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer mb-2"
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
                checked={answers[currentQuestion.id] === option.id}
                onChange={() => handleAnswer(option.id)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="ml-3">{option.text}</span>
            </label>
          ))}

        {/* MULTI */}
        {currentQuestion.type === "multi" &&
          currentQuestion.options?.map((option) => {
            const selected = answers[currentQuestion.id] || [];
            return (
              <label
                key={option.id}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer mb-2"
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
                <span className="ml-3">{option.text}</span>
              </label>
            );
          })}

        {/* TRUE / FALSE */}
        {currentQuestion.type === "true_false" &&
          ["true", "false"].map((val) => (
            <label
              key={val}
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer mb-2"
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
                checked={answers[currentQuestion.id] === val}
                onChange={() => handleAnswer(val)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="ml-3">{val.toUpperCase()}</span>
            </label>
          ))}

        {/* FILL BLANK */}
        {currentQuestion.type === "fill_blank" && (
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        )}

        {/* SHORT ANSWER */}
        {currentQuestion.type === "short" && (
          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            rows={4}
            placeholder="Write your answer..."
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t p-6 flex justify-between bg-gray-50">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-lg ${
            currentQuestionIndex === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
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
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
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
