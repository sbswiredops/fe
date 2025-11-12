"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import useToast from "@/components/hoock/toast";
import DataTable from "@/components/ui/DataTable";
import { API_CONFIG } from "@/lib/config";

import TabsNav from "../components/TabsNav";
import QuizzesForm from "../components/QuizzesForm";
import QuizzesServerTable from "../components/QuizzesServerTable";

import CourseService from "@/services/courseService";
import { sectionService } from "@/services/sectionService";
import { quizService } from "@/services/quizService";
import type { Course, Section, Quiz } from "@/types/api";

type QuestionType = "mcq" | "multi" | "true_false" | "fill_blank" | "short";

type QuestionOptionInput = { text: string; isCorrect: boolean };

const createQuestionForm = (type: QuestionType = "mcq") => ({
  text: "",
  type,
  correctAnswer: type === "true_false" ? "True" : "",
  options:
    type === "true_false"
      ? [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ]
      : [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
});

function QuizzesManagement() {
  const { showToast, ToastContainer } = useToast();

  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [sections, setSections] = React.useState<
    (Section & { courseName?: string })[]
  >([]);
  const [refreshTick, setRefreshTick] = React.useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});
  const [isQuestionDrawerOpen, setIsQuestionDrawerOpen] = React.useState(false);
  const [selectedQuizForQuestion, setSelectedQuizForQuestion] =
    React.useState<Quiz | null>(null);
  const [questionForms, setQuestionForms] = React.useState([
    createQuestionForm(),
  ]);
  const [questionDrawerVisible, setQuestionDrawerVisible] =
    React.useState(false);
  const [isSubmittingQuestions, setIsSubmittingQuestions] =
    React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = React.useState(false);
  const [questionsList, setQuestionsList] = React.useState<any[]>([]);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] =
    React.useState<Quiz | null>(null);

  const [drawerType, setDrawerType] = React.useState<null | "add" | "view">(
    null
  );

  const [selectedQuestion, setSelectedQuestion] = React.useState<any>(null);
  const [questionModalType, setQuestionModalType] = React.useState<
    null | "view" | "edit" | "delete"
  >(null);

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, quizzes]);

  React.useEffect(() => {
    const loadCourses = async () => {
      if (!serverEnabled) return;
      try {
        const res: any = await CourseService.getCourses({
          page: 1,
          limit: 1000,
        });
        const arr: any[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.courses)
          ? res.data.courses
          : Array.isArray(res?.courses)
          ? res.courses
          : [];
        setCourses(arr as any);
      } catch {}
    };
    loadCourses();
  }, [serverEnabled]);

  React.useEffect(() => {
    const loadSections = async () => {
      if (!serverEnabled) return;
      try {
        const res: any = await sectionService.listAll({ page: 1, limit: 1000 });
        const secs: any[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.sections)
          ? res.data.sections
          : Array.isArray(res?.sections)
          ? res.sections
          : [];
        const mapped = secs.map((s: any) => ({
          ...s,
          courseId: s?.course?.id,
          courseName: s?.course?.title || s?.course?.name || "",
        }));
        setSections(mapped as any);
      } catch {}
    };
    loadSections();
  }, [serverEnabled, refreshTick]);

  // Fallback client data fetch (optional demonstration)
  React.useEffect(() => {
    if (serverEnabled) return;
    // keep client list empty until user adds locally
  }, [serverEnabled]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as HTMLInputElement & { files?: FileList };
    const { name } = target;
    const value = (target as any).value;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setFormData({});

  const openViewModal = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };
  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleAddQuestionClick = (quiz: Quiz) => {
    setSelectedQuizForQuestion(quiz);
    setQuestionForms([createQuestionForm()]);
    setDrawerType("add");
    setIsQuestionDrawerOpen(true);
  };

  // Handler for View Questions button
  const handleViewQuestions = async (quiz: Quiz) => {
    setSelectedQuizForQuestions(quiz);
    setDrawerType("view");
    setIsQuestionDrawerOpen(true);
    try {
      const res = await quizService.getQuestions(quiz.id);
      setQuestionsList(res.data || []);
    } catch {
      setQuestionsList([]);
      showToast("Failed to load questions", "error");
    }
  };

  const handleAdd = async () => {
    try {
      const payload: any = {
        courseId: formData.courseId || undefined,
        sectionId: formData.sectionId || undefined,
        title: formData.title,
        description: formData.description,
        isLocked: !!formData.isLocked,
        isPaid: !!formData.isPaid,
        price:
          formData.price !== "" && formData.price !== undefined
            ? parseFloat(formData.price as any)
            : undefined,
      };
      const res = await quizService.create(payload);
      if (res.success) {
        showToast("Quiz created", "success");
        if (res.data) setQuizzes((p) => [res.data as any, ...p]);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to create quiz", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to create quiz", "error");
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        isLocked:
          typeof formData.isLocked === "boolean"
            ? formData.isLocked
            : undefined,
        isPaid:
          typeof formData.isPaid === "boolean" ? formData.isPaid : undefined,
        price:
          formData.price !== "" && formData.price !== undefined
            ? parseFloat(formData.price as any)
            : undefined,
      };
      const res = await quizService.update(selectedItem.id, payload);
      if (res.success) {
        showToast("Quiz updated", "success");
        setQuizzes((prev) =>
          prev.map((q: any) =>
            q.id === selectedItem.id ? { ...q, ...payload } : q
          )
        );
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update quiz", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update quiz", "error");
    }
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await quizService.delete(selectedItem.id);
      if (res.success) {
        showToast("Quiz deleted", "success");
        setQuizzes((prev) => prev.filter((q: any) => q.id !== selectedItem.id));
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to delete quiz", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete quiz", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const filtered = React.useMemo(() => {
    return quizzes.filter((item: any) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.course?.title || item.courseName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [quizzes, searchTerm]);

  const totalItems = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

  const renderClientTable = () => (
    <DataTable
      columns={[
        {
          key: "title",
          header: "Title",
          render: (q: any) => (
            <span className="text-sm font-medium text-gray-900">{q.title}</span>
          ),
        },
        {
          key: "courseName",
          header: "Course",
          render: (q: any) => (
            <span className="text-sm text-gray-900">{q.courseName || "-"}</span>
          ),
        },
        {
          key: "sectionName",
          header: "Section",
          render: (q: any) => (
            <span className="text-sm text-gray-900">
              {q.sectionName || "-"}
            </span>
          ),
        },
        {
          key: "isLocked",
          header: "Locked",
          render: (q: any) => (
            <span className="text-sm text-gray-900">
              {q.isLocked ? "Yes" : "No"}
            </span>
          ),
        },
        {
          key: "isPaid",
          header: "Paid",
          render: (q: any) => (
            <span className="text-sm text-gray-900">
              {q.isPaid ? "Yes" : "No"}
            </span>
          ),
        },
        {
          key: "price",
          header: "Price",
          render: (q: any) => (
            <span className="text-sm text-gray-900">
              {typeof q.price === "number" ? `$${q.price}` : "-"}
            </span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          render: (q: any) => (
            <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openViewModal(q)}
                className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start"
              >
                View
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditModal(q)}
                className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAddQuestionClick(q)}
                className="text-green-600 hover:text-green-900 w-full md:w-auto justify-center md:justify-start"
              >
                Add Question
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDeleteModal(q)}
                className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start"
              >
                Delete
              </Button>
            </div>
          ),
        },
      ]}
      rows={paginated as any}
      getRowKey={(row: any) => row.id}
      page={page}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={setPage}
    />
  );

  const renderDetailValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" || typeof value === "number") {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return `${value.length} items`;
    }
    if (typeof value === "object") {
      if ("title" in value && typeof value.title === "string") {
        return value.title;
      }
      if ("name" in value && typeof value.name === "string") {
        return value.name;
      }
    }
    return "N/A";
  };

  React.useEffect(() => {
    if (isQuestionDrawerOpen) {
      setQuestionDrawerVisible(true);
      return;
    }
    const timeout = setTimeout(() => setQuestionDrawerVisible(false), 300);
    return () => clearTimeout(timeout);
  }, [isQuestionDrawerOpen]);

  const closeQuestionDrawer = () => {
    setIsQuestionDrawerOpen(false);
    setSelectedQuizForQuestion(null);
    setQuestionForms([createQuestionForm()]);
  };

  const handleQuestionFieldChange = (
    questionIndex: number,
    field: "text" | "type" | "correctAnswer",
    value: string
  ) => {
    setQuestionForms((prev) => {
      const next = [...prev];
      const current = next[questionIndex];
      if (!current) return prev;

      if (field === "type") {
        const nextType = value as QuestionType;
        const reset = createQuestionForm(nextType);
        reset.text = current.text;
        if (nextType === "fill_blank" || nextType === "short") {
          reset.correctAnswer = current.correctAnswer;
        }
        next[questionIndex] = reset;
        return next;
      }

      next[questionIndex] = { ...current, [field]: value };
      return next;
    });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestionForms((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      if (!question) return prev;
      const options = [...question.options];
      options[optionIndex] = { ...options[optionIndex], text: value };
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const toggleCorrectOption = (
    questionIndex: number,
    optionIndex: number,
    multiSelect: boolean
  ) => {
    setQuestionForms((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      if (!question) return prev;

      const options = question.options.map((opt, idx) =>
        multiSelect
          ? idx === optionIndex
            ? { ...opt, isCorrect: !opt.isCorrect }
            : opt
          : { ...opt, isCorrect: idx === optionIndex }
      );

      next[questionIndex] = {
        ...question,
        options,
        correctAnswer:
          question.type === "true_false"
            ? options[optionIndex].text
            : question.correctAnswer,
      };

      return next;
    });
  };

  const addOptionRow = (questionIndex: number) => {
    setQuestionForms((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      if (!question) return prev;
      next[questionIndex] = {
        ...question,
        options: [...question.options, { text: "", isCorrect: false }],
      };
      return next;
    });
  };

  const removeOptionRow = (questionIndex: number, optionIndex: number) => {
    setQuestionForms((prev) => {
      const next = [...prev];
      const question = next[questionIndex];
      if (!question || question.options.length <= 2) return prev;
      const options = question.options.filter((_, idx) => idx !== optionIndex);
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const addQuestionFormBlock = () => {
    setQuestionForms((prev) => [...prev, createQuestionForm()]);
  };

  const removeQuestionFormBlock = (questionIndex: number) => {
    setQuestionForms((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== questionIndex);
    });
  };

  const submitQuizQuestions = React.useCallback(
    async (quizId: string, questionsPayload: any[]) => {
      if (!serverEnabled) {
        return { success: true };
      }

      if (typeof (quizService as any).addQuestions === "function") {
        return (quizService as any).addQuestions(quizId, {
          questions: questionsPayload,
        });
      }

      const baseUrl = (API_CONFIG.BASE_URL || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/quizzes/${quizId}/questions/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ questions: questionsPayload }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.error || data?.message || "Failed to submit questions"
        );
      }

      return data;
    },
    [serverEnabled]
  );

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizForQuestion) return;

    setIsSubmittingQuestions(true);

    const payload: any[] = [];

    for (let i = 0; i < questionForms.length; i += 1) {
      const form = questionForms[i];
      if (!form.text.trim()) {
        showToast(`Question ${i + 1} text is required`, "error");
        setIsSubmittingQuestions(false);
        return;
      }

      const trimmedOptions = form.options
        .map((opt) => ({ ...opt, text: opt.text.trim() }))
        .filter((opt) => opt.text);

      if (
        (form.type === "mcq" || form.type === "multi") &&
        trimmedOptions.length < 2
      ) {
        showToast(`Add at least two options for question ${i + 1}`, "error");
        setIsSubmittingQuestions(false);
        return;
      }

      if (
        (form.type === "mcq" || form.type === "true_false") &&
        !trimmedOptions.some((opt) => opt.isCorrect)
      ) {
        showToast(`Select a correct option for question ${i + 1}`, "error");
        setIsSubmittingQuestions(false);
        return;
      }

      if (
        form.type === "multi" &&
        !trimmedOptions.some((opt) => opt.isCorrect)
      ) {
        showToast(
          `Select at least one correct option for question ${i + 1}`,
          "error"
        );
        setIsSubmittingQuestions(false);
        return;
      }

      if (
        (form.type === "fill_blank" || form.type === "short") &&
        !form.correctAnswer.trim()
      ) {
        showToast(`Enter a correct answer for question ${i + 1}`, "error");
        setIsSubmittingQuestions(false);
        return;
      }

      payload.push({
        quizId: selectedQuizForQuestion.id,
        text: form.text.trim(),
        type: form.type,
        correctAnswer:
          form.type === "fill_blank" || form.type === "short"
            ? form.correctAnswer.trim()
            : form.type === "true_false"
            ? trimmedOptions.find((opt) => opt.isCorrect)?.text
            : undefined,
        options:
          form.type === "mcq" ||
          form.type === "multi" ||
          form.type === "true_false"
            ? trimmedOptions
            : undefined,
      });
    }

    try {
      await submitQuizQuestions(selectedQuizForQuestion.id, payload);
      showToast("Questions submitted successfully", "success");
      closeQuestionDrawer();
      setRefreshTick((x) => x + 1);
    } catch (error: any) {
      showToast(error?.message || "Failed to submit questions", "error");
    } finally {
      setIsSubmittingQuestions(false);
    }
  };

  // Handle view
  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setQuestionModalType("view");
  };

  // Handle edit
  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setQuestionModalType("edit");
  };

  // Handle delete
  const handleDeleteQuestion = (question: any) => {
    setSelectedQuestion(question);
    setQuestionModalType("delete");
  };

  // Confirm delete
  const confirmDeleteQuestion = async () => {
    if (!selectedQuestion) return;
    try {
      await quizService.deleteQuestion(selectedQuestion.id);
      setQuestionsList((prev) =>
        prev.filter((q) => q.id !== selectedQuestion.id)
      );
      showToast("Question deleted", "success");
    } catch {
      showToast("Failed to delete question", "error");
    }
    setSelectedQuestion(null);
    setQuestionModalType(null);
  };

  // Save edit
  const handleSaveEditQuestion = async () => {
    if (!selectedQuestion) return;
    try {
      await quizService.updateQuestion(selectedQuestion.id, selectedQuestion);
      setQuestionsList((prev) =>
        prev.map((q) => (q.id === selectedQuestion.id ? selectedQuestion : q))
      );
      showToast("Question updated", "success");
    } catch {
      showToast("Failed to update question", "error");
    }
    setSelectedQuestion(null);
    setQuestionModalType(null);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Quizzes
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Manage course quizzes
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="hidden sm:inline">Add Quiz</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder={`Search quizzes...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-transparent mb-1 select-none">
                Clear
              </label>
              <Button
                variant="dangerOutline"
                onClick={() => {
                  setSearchTerm("");
                }}
                className="w-full h-12 flex items-center justify-center"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full table-container">
            <div className="min-w-[320px] sm:min-w-[600px] lg:min-w-[900px]">
              {serverEnabled ? (
                <QuizzesServerTable
                  searchTerm={searchTerm}
                  statusFilter=""
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onAddQuestion={handleAddQuestionClick}
                  onViewQuestions={handleViewQuestions} // <-- Pass handler here
                  deps={[refreshTick]}
                />
              ) : (
                renderClientTable()
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedItem(null);
            resetForm();
          }}
          title={isAddModalOpen ? "Add Quiz" : "Edit Quiz"}
          size="lg"
        >
          <div className="space-y-4">
            <QuizzesForm
              formData={formData}
              onChange={handleInputChange}
              setFormData={setFormData}
              courses={courses as any}
              sections={sections as any}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="danger"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit}>
                {isAddModalOpen ? "Add" : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          title={`Quiz Details`}
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedItem)
                  .filter(([key]) => key !== "id")
                  .map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <p className="text-sm text-gray-900">
                        {renderDetailValue(value)}
                      </p>
                    </div>
                  ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedItem(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={handleDelete}
          title={`Delete Quiz`}
          message={`Are you sure you want to delete this quiz? This action cannot be undone.`}
          type="danger"
        />

        {/* Questions Modal */}
        <Modal
          isOpen={isQuestionsModalOpen}
          onClose={() => {
            setIsQuestionsModalOpen(false);
            setSelectedQuizForQuestions(null);
            setQuestionsList([]);
          }}
          title={`Questions for "${selectedQuizForQuestions?.title || ""}"`}
          size="lg"
        >
          <div className="space-y-4">
            {questionsList.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No questions found for this quiz.
              </p>
            ) : (
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-left">#</th>
                    <th className="border px-3 py-2 text-left">Question</th>
                    <th className="border px-3 py-2 text-left">Type</th>
                    <th className="border px-3 py-2 text-left">
                      Options / Answer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {questionsList.map((q, idx) => (
                    <tr key={q.id || idx}>
                      <td className="border px-3 py-2">{idx + 1}</td>
                      <td className="border px-3 py-2">{q.text}</td>
                      <td className="border px-3 py-2">{q.type}</td>
                      <td className="border px-3 py-2">
                        {q.options ? (
                          q.options.map((opt: any, i: number) => (
                            <div key={i}>
                              <span
                                className={
                                  opt.isCorrect
                                    ? "font-bold text-green-600"
                                    : "text-gray-900"
                                }
                              >
                                {opt.text}
                                {opt.isCorrect ? " (Correct)" : ""}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-900">
                            {q.correctAnswer || "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsQuestionsModalOpen(false);
                  setSelectedQuizForQuestions(null);
                  setQuestionsList([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        {questionModalType === "view" && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setSelectedQuestion(null);
                setQuestionModalType(null);
              }}
            />
            <Modal
              isOpen={true}
              onClose={() => {
                setSelectedQuestion(null);
                setQuestionModalType(null);
              }}
              title="View Question"
              size="md"
            >
              {selectedQuestion && (
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-gray-700">
                      Question
                    </label>
                    <div className="text-gray-900">{selectedQuestion.text}</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Type</label>
                    <div className="text-gray-900">{selectedQuestion.type}</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">
                      Options / Answer
                    </label>
                    <div>
                      {selectedQuestion.options ? (
                        selectedQuestion.options.map((opt: any, i: number) => (
                          <div key={i}>
                            <span
                              className={
                                opt.isCorrect
                                  ? "font-bold text-green-600"
                                  : "text-gray-900"
                              }
                            >
                              {opt.text}
                              {opt.isCorrect ? " (Correct)" : ""}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-900">
                          {selectedQuestion.correctAnswer || "-"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={questionModalType === "edit"}
          onClose={() => {
            setSelectedQuestion(null);
            setQuestionModalType(null);
          }}
          title="Edit Question"
          size="md"
        >
          {selectedQuestion && (
            <div className="space-y-3">
              <div>
                <label className="font-medium text-gray-700">Question</label>
                <Input
                  value={selectedQuestion.text}
                  onChange={(e) =>
                    setSelectedQuestion({
                      ...selectedQuestion,
                      text: e.target.value,
                    })
                  }
                />
              </div>
              {/* Add more fields as needed for editing options/answer */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedQuestion(null);
                    setQuestionModalType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEditQuestion} className="ml-2">
                  Save
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Modal */}
        <ConfirmationModal
          isOpen={questionModalType === "delete"}
          onClose={() => {
            setSelectedQuestion(null);
            setQuestionModalType(null);
          }}
          onConfirm={confirmDeleteQuestion}
          title="Delete Question"
          message="Are you sure you want to delete this question?"
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />

      {questionDrawerVisible && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isQuestionDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeQuestionDrawer}
          />
          <div
            className={`relative ml-auto flex h-full w-[99vw] sm:w-[90vw] md:w-[80vw] lg:w-[700px] xl:w-[600px] flex-col bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
              isQuestionDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Question
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedQuizForQuestion?.title || ""}
                </p>
              </div>
              <Button variant="ghost" onClick={closeQuestionDrawer}>
                Close
              </Button>
            </div>
            <form
              id="quiz-question-form"
              className="flex flex-1 min-h-0 flex-col"
              onSubmit={handleSubmitQuestion}
            >
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
                <div className="space-y-5">
                  {questionForms.map((questionForm, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="rounded-lg border border-gray-200 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          Question {questionIndex + 1}
                        </span>
                        {questionForms.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeQuestionFormBlock(questionIndex)
                            }
                            className="text-red-500"
                          >
                            Remove Question
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Question
                        </label>
                        <textarea
                          rows={4}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-black shadow-sm focus:border-indigo-500 focus:outline-none"
                          value={questionForm.text}
                          onChange={(e) =>
                            handleQuestionFieldChange(
                              questionIndex,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                          value={questionForm.type}
                          onChange={(e) =>
                            handleQuestionFieldChange(
                              questionIndex,
                              "type",
                              e.target.value
                            )
                          }
                        >
                          <option value="mcq">
                            Multiple choice (single answer)
                          </option>
                          <option value="multi">
                            Multiple choice (multiple answers)
                          </option>
                          <option value="true_false">True / False</option>
                          <option value="fill_blank">Fill in the blank</option>
                          <option value="short">Short answer</option>
                        </select>
                      </div>

                      {(questionForm.type === "mcq" ||
                        questionForm.type === "multi") && (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <label className="text-sm font-medium text-gray-700">
                              Options
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOptionRow(questionIndex)}
                              className="w-full sm:w-auto"
                            >
                              Add Option
                            </Button>
                          </div>
                          {questionForm.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3"
                            >
                              <input
                                className="flex-1 min-w-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-black shadow-sm focus:border-indigo-500 focus:outline-none"
                                value={option.text}
                                onChange={(e) =>
                                  handleOptionChange(
                                    questionIndex,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={option.isCorrect}
                                  onChange={() =>
                                    toggleCorrectOption(
                                      questionIndex,
                                      optionIndex,
                                      questionForm.type === "multi"
                                    )
                                  }
                                />
                                Correct
                              </label>
                              {questionForm.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeOptionRow(questionIndex, optionIndex)
                                  }
                                  className="text-red-500 justify-center px-2"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {questionForm.type === "true_false" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Correct answer
                          </label>
                          <div className="space-y-2 rounded-md border border-gray-200 p-3">
                            {questionForm.options.map((option, optionIndex) => {
                              const isActive = option.isCorrect;
                              return (
                                <label
                                  key={optionIndex}
                                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                                    isActive
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-gray-100 bg-white text-gray-800"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {option.text}
                                  </span>
                                  <input
                                    type="radio"
                                    name={`trueFalse-${questionIndex}`}
                                    checked={isActive}
                                    onChange={() => {
                                      toggleCorrectOption(
                                        questionIndex,
                                        optionIndex,
                                        false
                                      );
                                      handleQuestionFieldChange(
                                        questionIndex,
                                        "correctAnswer",
                                        option.text
                                      );
                                    }}
                                    className="accent-emerald-600"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(questionForm.type === "fill_blank" ||
                        questionForm.type === "short") && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Correct answer
                          </label>
                          <Input
                            value={questionForm.correctAnswer}
                            onChange={(e) =>
                              handleQuestionFieldChange(
                                questionIndex,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            placeholder="Enter correct answer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestionFormBlock}
                  className="mt-6"
                >
                  Add another question
                </Button>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsQuestionDrawerOpen(false);
                    setDrawerType(null);
                    setSelectedQuizForQuestion(null);
                    setQuestionForms([createQuestionForm()]);
                  }}
                  disabled={isSubmittingQuestions}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingQuestions}
                  className="min-w-[120px] justify-center"
                >
                  {isSubmittingQuestions ? "Submitting..." : "Save Questions"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQuestionDrawerOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isQuestionDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              setIsQuestionDrawerOpen(false);
              setDrawerType(null);
              setSelectedQuizForQuestion(null);
              setSelectedQuizForQuestions(null);
              setQuestionsList([]);
              setQuestionForms([createQuestionForm()]);
            }}
          />
          <div
            className={`relative ml-auto flex h-full w-[99vw] sm:w-[90vw] md:w-[80vw] lg:w-[700px] xl:w-[600px] flex-col bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
              isQuestionDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {drawerType === "add" && (
              <>
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Add Question
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedQuizForQuestion?.title || ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsQuestionDrawerOpen(false);
                      setDrawerType(null);
                      setSelectedQuizForQuestion(null);
                      setQuestionForms([createQuestionForm()]);
                    }}
                  >
                    Close
                  </Button>
                </div>
                <form
                  id="quiz-question-form"
                  className="flex flex-1 min-h-0 flex-col"
                  onSubmit={handleSubmitQuestion}
                >
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
                    <div className="space-y-5">
                      {questionForms.map((questionForm, questionIndex) => (
                        <div
                          key={questionIndex}
                          className="rounded-lg border border-gray-200 p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              Question {questionIndex + 1}
                            </span>
                            {questionForms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeQuestionFormBlock(questionIndex)
                                }
                                className="text-red-500"
                              >
                                Remove Question
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Question
                            </label>
                            <textarea
                              rows={4}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-black shadow-sm focus:border-indigo-500 focus:outline-none"
                              value={questionForm.text}
                              onChange={(e) =>
                                handleQuestionFieldChange(
                                  questionIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder="Enter question text"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Type
                            </label>
                            <select
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                              value={questionForm.type}
                              onChange={(e) =>
                                handleQuestionFieldChange(
                                  questionIndex,
                                  "type",
                                  e.target.value
                                )
                              }
                            >
                              <option value="mcq">
                                Multiple choice (single answer)
                              </option>
                              <option value="multi">
                                Multiple choice (multiple answers)
                              </option>
                              <option value="true_false">True / False</option>
                              <option value="fill_blank">
                                Fill in the blank
                              </option>
                              <option value="short">Short answer</option>
                            </select>
                          </div>

                          {(questionForm.type === "mcq" ||
                            questionForm.type === "multi") && (
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <label className="text-sm font-medium text-gray-700">
                                  Options
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOptionRow(questionIndex)}
                                  className="w-full sm:w-auto"
                                >
                                  Add Option
                                </Button>
                              </div>
                              {questionForm.options.map(
                                (option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3"
                                  >
                                    <input
                                      className="flex-1 min-w-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-black shadow-sm focus:border-indigo-500 focus:outline-none"
                                      value={option.text}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          questionIndex,
                                          optionIndex,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={() =>
                                          toggleCorrectOption(
                                            questionIndex,
                                            optionIndex,
                                            questionForm.type === "multi"
                                          )
                                        }
                                      />
                                      Correct
                                    </label>
                                    {questionForm.options.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeOptionRow(
                                            questionIndex,
                                            optionIndex
                                          )
                                        }
                                        className="text-red-500 justify-center px-2"
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {questionForm.type === "true_false" && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Correct answer
                              </label>
                              <div className="space-y-2 rounded-md border border-gray-200 p-3">
                                {questionForm.options.map(
                                  (option, optionIndex) => {
                                    const isActive = option.isCorrect;
                                    return (
                                      <label
                                        key={optionIndex}
                                        className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                                          isActive
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : "border-gray-100 bg-white text-gray-800"
                                        }`}
                                      >
                                        <span className="font-medium">
                                          {option.text}
                                        </span>
                                        <input
                                          type="radio"
                                          name={`trueFalse-${questionIndex}`}
                                          checked={isActive}
                                          onChange={() => {
                                            toggleCorrectOption(
                                              questionIndex,
                                              optionIndex,
                                              false
                                            );
                                            handleQuestionFieldChange(
                                              questionIndex,
                                              "correctAnswer",
                                              option.text
                                            );
                                          }}
                                          className="accent-emerald-600"
                                        />
                                      </label>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {(questionForm.type === "fill_blank" ||
                            questionForm.type === "short") && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Correct answer
                              </label>
                              <Input
                                value={questionForm.correctAnswer}
                                onChange={(e) =>
                                  handleQuestionFieldChange(
                                    questionIndex,
                                    "correctAnswer",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter correct answer"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addQuestionFormBlock}
                      className="mt-6"
                    >
                      Add another question
                    </Button>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsQuestionDrawerOpen(false);
                        setDrawerType(null);
                        setSelectedQuizForQuestion(null);
                        setQuestionForms([createQuestionForm()]);
                      }}
                      disabled={isSubmittingQuestions}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingQuestions}
                      className="min-w-[120px] justify-center"
                    >
                      {isSubmittingQuestions
                        ? "Submitting..."
                        : "Save Questions"}
                    </Button>
                  </div>
                </form>
              </>
            )}
            {drawerType === "view" && (
              <>
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Questions for "{selectedQuizForQuestions?.title || ""}"
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsQuestionDrawerOpen(false);
                      setDrawerType(null);
                      setSelectedQuizForQuestions(null);
                      setQuestionsList([]);
                    }}
                  >
                    Close
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
                  {questionsList.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No questions found for this quiz.
                    </p>
                  ) : (
                    <table className="min-w-full border text-sm rounded-lg overflow-hidden shadow">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-3 py-2 text-left text-gray-700 font-semibold w-12">
                            #
                          </th>
                          <th className="border px-3 py-2 text-left text-gray-700 font-semibold">
                            Question
                          </th>
                          <th className="border px-3 py-2 text-left text-gray-700 font-semibold w-32">
                            Type
                          </th>
                          <th className="border px-3 py-2 text-left text-gray-700 font-semibold">
                            Options / Answer
                          </th>
                          <th className="border px-3 py-2 text-left text-gray-700 font-semibold w-40">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionsList.map((q, idx) => (
                          <tr
                            key={q.id || idx}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="border px-3 py-2 text-gray-900">
                              {idx + 1}
                            </td>
                            <td className="border px-3 py-2 text-gray-900">
                              {q.text}
                            </td>
                            <td className="border px-3 py-2 text-gray-900">
                              {q.type}
                            </td>
                            <td className="border px-3 py-2">
                              {q.options ? (
                                q.options.map((opt: any, i: number) => (
                                  <div key={i}>
                                    <span
                                      className={
                                        opt.isCorrect
                                          ? "font-bold text-green-600"
                                          : "text-gray-900"
                                      }
                                    >
                                      {opt.text}
                                      {opt.isCorrect ? " (Correct)" : ""}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-900">
                                  {q.correctAnswer || "-"}
                                </span>
                              )}
                            </td>
                            <td className="border px-3 py-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewQuestion(q)}
                                  className="text-blue-600 border-blue-200"
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditQuestion(q)}
                                  className="text-yellow-600 border-yellow-200"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteQuestion(q)}
                                  className="text-red-600 border-red-200"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function QuizzesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <QuizzesManagement />
    </ProtectedRoute>
  );
}
