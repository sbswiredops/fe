"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TabsNav from "../components/TabsNav";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import useToast from "@/components/hoock/toast";
import { CourseService } from "@/services/courseService";
import { FaqService } from "@/services/faqService"; // <-- Add this
import { useAuth } from "@/components/contexts/AuthContext"; // <-- Add this

interface Faq {
  id: string;
  question: string;
  answer: string;
  updatedAt: string;
  courseId: string;
}

function FaqsManagement() {
  const { showToast, ToastContainer } = useToast();
  const { user } = useAuth(); // <-- For token if needed

  const [courseOptions, setCourseOptions] = React.useState<
    { id: string; title: string }[]
  >([]);

  const getCourseTitle = (id?: string | null) =>
    courseOptions.find((c) => c.id === id)?.title || (id ? `ID: ${id}` : "—");

  React.useEffect(() => {
    const ac = new AbortController();
    const courseService = new CourseService();
    const load = async () => {
      try {
        const res = await courseService.getCourses();
        if (!res.success) throw new Error("Failed to fetch courses");
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.courses ?? [];

        const normalized = list.map((c: any) => ({
          id: String(c.id ?? c._id ?? ""),
          title: String(c.title ?? c.name ?? "Untitled"),
        }));
        setCourseOptions(normalized);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          showToast?.("Failed to load courses", "error");
        }
      }
    };
    load();
    return () => ac.abort();
  }, [showToast]);

  // --- FAQ Service Integration ---
  const faqService = React.useMemo(() => new FaqService(), []);
  const [faqs, setFaqs] = React.useState<Faq[]>([]);
  const [loadingFaqs, setLoadingFaqs] = React.useState(false);

  // Load all FAQs (optionally for all courses, or you can filter by course)
  const loadFaqs = async () => {
    setLoadingFaqs(true);
    try {
      let allFaqs: Faq[] = [];
      for (const course of courseOptions) {
        const res = await faqService.listFaqs(course.id);
        if (res.success && Array.isArray(res.data)) {
          allFaqs = [...allFaqs, ...res.data];
        }
      }
      setFaqs(allFaqs);
    } catch {
      showToast("Failed to load FAQs", "error");
    } finally {
      setLoadingFaqs(false);
    }
  };

  React.useEffect(() => {
    if (courseOptions.length > 0) {
      loadFaqs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseOptions]);

  const [search, setSearch] = React.useState("");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Faq | null>(null);

  const [form, setForm] = React.useState<Partial<Faq>>({
    question: "",
    answer: "",
    courseId: "",
  });

  const filtered = faqs.filter((f) => {
    const matchesSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const openAdd = () => {
    setForm({
      question: "",
      answer: "",
      courseId: "",
    });
    setSelected(null);
    setIsAddOpen(true);
  };

  const openEdit = (row: Faq) => {
    setSelected(row);
    setForm({
      ...row,
      courseId: row.courseId || "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (row: Faq) => {
    setSelected(row);
    setIsDeleteOpen(true);
  };

  const closeAll = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setSelected(null);
  };

  // --- CRUD with backend ---
  const saveNew = async () => {
    if (!form.question?.trim() || !form.answer?.trim()) {
      showToast("Question and answer are required.", "error");
      return;
    }
    if (!form.courseId) {
      showToast("Please select a course.", "error");
      return;
    }
    try {
      const res = await faqService.createFaq(form.courseId, {
        question: form.question,
        answer: form.answer,
        // Do NOT send courseId in payload for create
      });
      if (res.success) {
        showToast("FAQ added.", "success");
        closeAll();
        loadFaqs();
      } else {
        showToast(res.message || "Failed to add FAQ", "error");
      }
    } catch {
      showToast("Failed to add FAQ", "error");
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!form.question?.trim() || !form.answer?.trim()) {
      showToast("Question and answer are required.", "error");
      return;
    }
    if (!form.courseId) {
      showToast("Please select a course.", "error");
      return;
    }
    // Only send courseId if changed
    const payload: any = {
      question: form.question,
      answer: form.answer,
    };
    if (form.courseId !== selected.courseId) {
      payload.courseId = form.courseId;
    }
    try {
      const res = await faqService.updateFaq(selected.id, payload);
      if (res.success) {
        showToast("FAQ updated.", "success");
        closeAll();
        loadFaqs();
      } else {
        showToast(res.message || "Failed to update FAQ", "error");
      }
    } catch {
      showToast("Failed to update FAQ", "error");
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      const res = await faqService.deleteFaq(selected.id);
      if (res.success) {
        showToast("FAQ deleted.", "success");
        closeAll();
        loadFaqs();
      } else {
        showToast(res.message || "Failed to delete FAQ", "error");
      }
    } catch {
      showToast("Failed to delete FAQ", "error");
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TabsNav />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-xl font-semibold text-gray-900">FAQs</h1>
            <div className="flex gap-2">
              <Input
                placeholder="Search FAQs..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
              />
              <Button
                onClick={openAdd}
                className="btn-hover text-white"
                style={{
                  backgroundColor: "var(--color-text-primary)",
                  borderColor: "var(--color-text-primary)",
                }}
              >
                Add FAQ
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Question</th>
                  <th className="py-2 pr-4">Answer</th>
                  <th className="py-2 pr-4">Course</th>
                  <th className="py-2 pr-4">Updated</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingFaqs ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={5}>
                      No FAQs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-gray-900 max-w-[300px] truncate">
                        {row.question}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 max-w-[420px] truncate">
                        {row.answer}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                          {getCourseTitle(row.courseId)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {new Date(row.updatedAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="need" onClick={() => openEdit(row)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => openDelete(row)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={closeAll} title="Add FAQ">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <Input
              placeholder="Enter question"
              value={form.question || ""}
              onChange={(e: any) =>
                setForm((f) => ({ ...f, question: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
              rows={4}
              placeholder="Enter answer"
              value={form.answer || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, answer: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full text-gray-600"
              value={(form.courseId as string) || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, courseId: e.target.value }))
              }
            >
              <option value="">Select a course</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="danger" onClick={closeAll}>
              Cancel
            </Button>
            <Button
              onClick={saveNew}
              className="btn-hover text-white"
              style={{
                backgroundColor: "var(--color-text-primary)",
                borderColor: "var(--color-text-primary)",
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={closeAll} title="Edit FAQ">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <Input
              placeholder="Enter question"
              value={form.question || ""}
              onChange={(e: any) =>
                setForm((f) => ({ ...f, question: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
              rows={4}
              placeholder="Enter answer"
              value={form.answer || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, answer: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full text-gray-600"
              value={(form.courseId as string) || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, courseId: e.target.value }))
              }
            >
              <option value="">Select a course</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="danger" onClick={closeAll}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              className="btn-hover text-white"
              style={{
                backgroundColor: "var(--color-text-primary)",
                borderColor: "var(--color-text-primary)",
              }}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={closeAll}
        onConfirm={confirmDelete}
        title="Delete FAQ"
        message={`Are you sure you want to delete "${
          selected?.question || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </DashboardLayout>
  );
}

export default function FaqsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <FaqsManagement />
    </ProtectedRoute>
  );
}
