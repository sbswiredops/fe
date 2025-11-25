"use client";

import React, { useEffect, useState, useCallback } from "react";
import { quizService } from "@/services/quizService";

type QuestionType = "mcq" | "multi" | "true_false" | "fill_blank" | "short";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
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
  totalMarks?: number;
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
  isTabActive?: boolean;
}

export const QuizViewer: React.FC<QuizViewerProps> = ({
  quizId,
  quizTitle,
  onClose,
  className = "w-full h-full",
  isTabActive = true,
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasTimeExpired, setHasTimeExpired] = useState(false);
  const [forceClosed, setForceClosed] = useState(false);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);

  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detailsResponse = await quizService.getById(quizId);
        if (detailsResponse.data) {
          const quiz = detailsResponse.data;
          setQuizDetails({
            id: quiz.id,
            title: quiz.title,
            totalQuestions: quiz.totalQuestions ?? 0,
            totalTime: quiz.totalTime ?? 0,
            passMark: quiz.passMark ?? 0,
            hasNegativeMark: quiz.hasNegativeMark ?? false,
            negativeMarkPercentage: quiz.negativeMarkPercentage ?? 0,
            totalMarks: quiz.totalMarks ?? 0,
          });
        }

        const questionsResponse = await quizService.getQuestions(quizId);
        if (questionsResponse.data) {
          const mappedQuestions: Question[] = questionsResponse.data.map(
            (q: any, idx: number) => {
              // Deduplicate by option text but keep stable ids.
              const seen = new Set<string>();
              const rawOptions = q.options || [];

              const uniqueOptions = rawOptions.filter((opt: any) => {
                const text = String(opt.text ?? "");
                if (seen.has(text)) return false;
                seen.add(text);
                return true;
              });

              // Ensure every option has an id: prefer opt.id, then opt.value, then fallback to a generated id
              const options: Option[] = uniqueOptions.map(
                (opt: any, oidx: number) => {
                  const rawId = opt.id ?? opt.value ?? opt._id ?? opt.key;
                  const id =
                    rawId !== undefined && rawId !== null
                      ? String(rawId)
                      : `${q.id ?? q._id ?? q.questionId ?? idx}_${oidx}`;
                  const text = String(opt.text ?? String(opt.label ?? id));
                  return { id, text };
                }
              );

              return {
                id: q.id || q._id || q.questionId || idx.toString(),
                text: q.text,
                type: q.type,
                options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
              };
            }
          );
          setQuestions(mappedQuestions);
        }

        const startTimeKey = `quiz_start_time_${quizId}`;
        const savedStartTime = localStorage.getItem(startTimeKey);
        if (savedStartTime) {
          const elapsedSeconds = Math.floor(
            (Date.now() - parseInt(savedStartTime)) / 1000
          );
          const detailsData = detailsResponse.data;
          const totalTimeInSeconds = (detailsData?.totalTime ?? 0) * 60;
          const remaining = Math.max(0, totalTimeInSeconds - elapsedSeconds);
          setTimeRemaining(remaining);
          setHasStarted(true);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

  // Prepare answers BEFORE submitting:
  // Converts any option-text answers into option.id by matching current questions/options.
  const prepareAnswersForSubmit = (rawAnswers: Record<string, any>) => {
    const prepared: Record<string, any> = {};

    for (const q of questions) {
      const raw = rawAnswers[q.id];

      if (raw === undefined || raw === null) {
        // keep as-is (undefined means unanswered)
        continue;
      }

      // Helper to find option id by matching id first, then by text
      const resolveToOptionId = (value: any): string | null => {
        if (!q.options || q.options.length === 0) return null;
        const asString = String(value);
        // exact match by id
        const byId = q.options.find((opt) => String(opt.id) === asString);
        if (byId) return byId.id;
        // match by text (case-sensitive first, then case-insensitive)
        const byText = q.options.find((opt) => opt.text === asString);
        if (byText) return byText.id;
        const byTextLower = q.options.find(
          (opt) => String(opt.text).toLowerCase() === asString.toLowerCase()
        );
        if (byTextLower) return byTextLower.id;
        // nothing matched
        return null;
      };

      if (q.type === "mcq") {
        // Expect a single id; if value looks like text, convert
        if (typeof raw === "string" || typeof raw === "number") {
          const resolved = resolveToOptionId(raw);
          prepared[q.id] = resolved ?? String(raw); // fallback to raw if cannot resolve
        } else {
          // anything else (boolean? object?) just stringify or pass through
          prepared[q.id] = typeof raw === "boolean" ? raw : String(raw);
        }
      } else if (q.type === "multi") {
        // Expect an array. Normalize:
        let arrayVal: any[] = [];
        if (Array.isArray(raw)) arrayVal = raw;
        else if (typeof raw === "string") {
          // maybe the FE accidentally sent a JSON string or comma separated values
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) arrayVal = parsed;
            else arrayVal = raw.split(",").map((s) => s.trim());
          } catch {
            arrayVal = raw.split(",").map((s) => s.trim());
          }
        } else {
          // single value -> convert to array
          arrayVal = [raw];
        }

        const resolvedIds: string[] = [];
        for (const v of arrayVal) {
          const resolved = resolveToOptionId(v);
          if (resolved) resolvedIds.push(resolved);
          else {
            // if cannot resolve, still push string form (backend may decide)
            resolvedIds.push(String(v));
          }
        }

        prepared[q.id] = resolvedIds;
      } else if (q.type === "true_false") {
        // keep booleans as booleans
        if (typeof raw === "boolean") prepared[q.id] = raw;
        else if (typeof raw === "string") {
          const low = raw.toLowerCase();
          if (low === "true") prepared[q.id] = true;
          else if (low === "false") prepared[q.id] = false;
          else prepared[q.id] = Boolean(raw);
        } else {
          prepared[q.id] = Boolean(raw);
        }
      } else {
        // fill_blank / short -> keep as string
        if (typeof raw === "string") prepared[q.id] = raw;
        else prepared[q.id] = String(raw);
      }
    }

    return prepared;
  };

  const handleSubmitQuiz = useCallback(
    async (answersToSubmit: Record<string, any>) => {
      setIsSubmitting(true);
      try {
        const prepared = prepareAnswersForSubmit(answersToSubmit);
        // Useful debug (you can remove later)
        // console.log("[QuizViewer] prepared answers for submit:", prepared);

        const response = await quizService.submitQuiz(quizId, prepared);
        if (response.data) setResult(response.data);
        const startTimeKey = `quiz_start_time_${quizId}`;
        localStorage.removeItem(startTimeKey);
      } catch (err: any) {
        alert(err?.message || "Failed to submit quiz");
      } finally {
        setIsSubmitting(false);
      }
    },
    [quizId, questions]
  );

  useEffect(() => {
    if (!hasStarted || hasTimeExpired || result) return;

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setHasTimeExpired(true);
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [hasStarted, hasTimeExpired, result]);

  const handleStartQuiz = useCallback(() => {
    if (quizDetails) {
      setForceClosed(false);
      const startTimeKey = `quiz_start_time_${quizId}`;
      const now = Date.now();
      localStorage.setItem(startTimeKey, now.toString());
      setHasStarted(true);
      setTimeRemaining(quizDetails.totalTime * 60);
    }
  }, [quizDetails, quizId]);

  const resetAndRestartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(quizDetails?.totalTime ? quizDetails.totalTime * 60 : 0);
    setHasTimeExpired(false);
    setResult(null);
    setHasStarted(false);
  }, [quizDetails]);

  useEffect(() => {
    if (!hasTimeExpired || !hasStarted || result) return;
    handleSubmitQuiz(answers);
  }, [hasTimeExpired, hasStarted, result, answers, handleSubmitQuiz]);

  useEffect(() => {
    if (!hasStarted || result) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      handleSubmitQuiz(answers);
    };

    const handleUnload = () => {
      handleSubmitQuiz(answers);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && !result) {
        setForceClosed(true);
        handleSubmitQuiz(answers);
      } else if (!document.hidden && forceClosed && !result) {
        resetAndRestartQuiz();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    hasStarted,
    answers,
    result,
    handleSubmitQuiz,
    quizId,
    forceClosed,
    resetAndRestartQuiz,
  ]);

  // FIX: convert "true"/"false" to boolean for true_false questions
  const handleAnswer = (value: any) => {
    const currentQ = questions[currentQuestionIndex];
    let answerValue = value;
    if (currentQ?.type === "true_false") {
      if (value === "true") answerValue = true;
      else if (value === "false") answerValue = false;
    }
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: answerValue,
    }));
  };

  const toggleMultiSelect = (optionId: string) => {
    const q = questions[currentQuestionIndex];
    const prev = (answers[q.id] as any[]) || [];
    // Ensure we always keep IDs in local state (this uses option.id)
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

  const prevTabActiveRef = React.useRef(isTabActive);

  useEffect(() => {
    if (
      prevTabActiveRef.current === true &&
      isTabActive === false &&
      hasStarted &&
      !result
    ) {
      setForceClosed(true);
      handleSubmitQuiz(answers);
    } else if (
      prevTabActiveRef.current === false &&
      isTabActive === true &&
      forceClosed &&
      !result
    ) {
      resetAndRestartQuiz();
    }
    prevTabActiveRef.current = isTabActive;
  }, [
    isTabActive,
    hasStarted,
    result,
    forceClosed,
    answers,
    handleSubmitQuiz,
    resetAndRestartQuiz,
  ]);

  const handleSubmit = async () => {
    // Check for unanswered questions
    const unanswered = questions
      .map((q, idx) =>
        !answers.hasOwnProperty(q.id) ||
        answers[q.id] === "" ||
        (q.type === "multi" &&
          (!Array.isArray(answers[q.id]) || answers[q.id].length === 0))
          ? idx
          : -1
      )
      .filter((idx) => idx !== -1);

    if (unanswered.length > 0) {
      setUnansweredQuestions(unanswered);
      setShowUnansweredModal(true);
      return;
    }
    await handleSubmitQuiz(answers);
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
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full mx-auto">
        <p style={{ color: "red", fontWeight: "bold" }} className="mb-4">
          Note: The quiz will be automatically submitted if you reload, close
          the page, or when the time ends.
          <br />
          <span style={{ color: "darkred" }}>
            If you switch browser tab or minimize, the quiz will be closed and
            you must start again.
          </span>
        </p>
        {forceClosed && (
          <div className="mb-3 text-center text-red-600 font-semibold">
            Quiz closed due to tab change. Please start again.
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{quizTitle}</h2>
        <p className="text-gray-600 text-sm mb-4">
          Get ready to test your knowledge
        </p>

        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-sm text-gray-700">
          <div className="flex justify-between mb-1">
            <span>Total Questions:</span>
            <span className="font-semibold">{quizDetails.totalQuestions}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Total Marks:</span>
            <span className="font-semibold">
              {quizDetails.totalMarks ?? "-"}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Pass Mark:</span>
            <span className="font-semibold">{quizDetails.passMark}%</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Total Time:</span>
            <span className="font-semibold">{quizDetails.totalTime} min</span>
          </div>
          <div className="flex justify-between">
            <span>Negative Marking:</span>
            <span className="font-semibold">
              {quizDetails.hasNegativeMark
                ? `Yes (${quizDetails.negativeMarkPercentage ?? 0}%)`
                : "No"}
            </span>
          </div>
        </div>
        <button
          onClick={handleStartQuiz}
          className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg"
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
          <h3 className="text-xl font-bold mb-4 text-gray-900">Quiz Result</h3>
          <p className="text-gray-800">
            Score: <span className="font-bold">{result.initialScore}</span>
          </p>
          <p className="text-gray-800">
            Auto-graded:{" "}
            <span className="font-bold">{result.autoGradableQuestions}</span>
          </p>
          <p className="text-gray-800">
            Pending manual check:{" "}
            <span className="font-bold">{result.pendingManualCheck}</span>
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
      {/* Unanswered Modal */}
      {showUnansweredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.15)]">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2 text-red-600">
              Unanswered Questions
            </h2>
            <p className="mb-4 text-gray-700">
              You have not answered all questions. Are you sure you want to
              submit?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                onClick={() => {
                  setShowUnansweredModal(false);
                  if (unansweredQuestions.length > 0) {
                    setCurrentQuestionIndex(unansweredQuestions[0]);
                  }
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={async () => {
                  setShowUnansweredModal(false);
                  await handleSubmitQuiz(answers);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Quiz UI */}
      <div
        className={`${className} bg-white flex flex-col overflow-hidden max-w-full w-full rounded-2xl shadow-lg`}
      >
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-white break-words">
              {quizTitle}
            </h3>
            <div className="flex items-center gap-4">
              {hasStarted && !result && (
                <div
                  className={`text-sm sm:text-base font-bold ${
                    timeRemaining <= 60 ? "text-red-300" : "text-white"
                  }`}
                >
                  {Math.floor(timeRemaining / 60)}:
                  {String(timeRemaining % 60).padStart(2, "0")}
                </div>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white hover:bg-purple-800 p-1 rounded transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 sm:mt-4 bg-purple-500 h-2 rounded-full">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <h4 className="text-base sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 break-words">
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
                <span
                  className={`ml-3 ${
                    answers[currentQuestion.id] === option.id
                      ? "text-purple-700 font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  {option.text}
                </span>
              </label>
            ))}

          {/* MULTI */}
          {currentQuestion.type === "multi" &&
            currentQuestion.options?.map((option) => {
              const selected = (answers[currentQuestion.id] as string[]) || [];
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
                  <span
                    className={`ml-3 ${
                      selected.includes(option.id)
                        ? "text-blue-700 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {option.text}
                  </span>
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
                    answers[currentQuestion.id] === (val === "true")
                      ? "#2563eb"
                      : "#e5e7eb",
                  backgroundColor:
                    answers[currentQuestion.id] === (val === "true")
                      ? "#eff6ff"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  checked={answers[currentQuestion.id] === (val === "true")}
                  onChange={() => handleAnswer(val)}
                  className="w-4 h-4 accent-purple-600"
                />
                <span
                  className={`ml-3 ${
                    answers[currentQuestion.id] === (val === "true")
                      ? "text-purple-700 font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  {val.toUpperCase()}
                </span>
              </label>
            ))}

          {/* FILL BLANK */}
          {currentQuestion.type === "fill_blank" && (
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
            />
          )}

          {/* SHORT ANSWER */}
          {currentQuestion.type === "short" && (
            <textarea
              className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              rows={4}
              placeholder="Write your answer..."
            />
          )}
        </div>

        <div className="border-t p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-gray-50 gap-3 sm:gap-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-3 py-2 rounded-lg text-sm border ${
              currentQuestionIndex === 0
                ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          <div className="flex gap-1 sm:gap-2 justify-center">
            {questions.map((_, idx) => {
              // FIX: Use hasOwnProperty so that false is also considered answered
              const isAnswered = answers.hasOwnProperty(questions[idx].id);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-sm ${
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
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizViewer;
