"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
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

function QuizzesManagement() {
  const { showToast, ToastContainer } = useToast();

  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [sections, setSections] = React.useState<(Section & { courseName?: string })[]>([]);
  const [refreshTick, setRefreshTick] = React.useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});

  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

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
        const res: any = await CourseService.getCourses({ page: 1, limit: 1000 });
        const arr: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.courses) ? res.data.courses : (Array.isArray(res?.courses) ? res.courses : []));
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
        const secs: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.sections) ? res.data.sections : (Array.isArray(res?.sections) ? res.sections : []));
        const mapped = secs.map((s: any) => ({ ...s, courseId: s?.course?.id, courseName: s?.course?.title || s?.course?.name || "" }));
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement & { files?: FileList };
    const { name } = target;
    const value = (target as any).value;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setFormData({});

  const openViewModal = (item: any) => { setSelectedItem(item); setIsViewModalOpen(true); };
  const openEditModal = (item: any) => { setSelectedItem(item); setFormData(item); setIsEditModalOpen(true); };
  const openDeleteModal = (item: any) => { setSelectedItem(item); setIsDeleteModalOpen(true); };

  const handleAdd = async () => {
    try {
      const payload: any = {
        courseId: formData.courseId || undefined,
        sectionId: formData.sectionId || undefined,
        title: formData.title,
        description: formData.description,
        isLocked: !!formData.isLocked,
        isPaid: !!formData.isPaid,
        price: formData.price !== '' && formData.price !== undefined ? parseFloat(formData.price as any) : undefined,
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
        isLocked: typeof formData.isLocked === 'boolean' ? formData.isLocked : undefined,
        isPaid: typeof formData.isPaid === 'boolean' ? formData.isPaid : undefined,
        price: formData.price !== '' && formData.price !== undefined ? parseFloat(formData.price as any) : undefined,
      };
      const res = await quizService.update(selectedItem.id, payload);
      if (res.success) {
        showToast("Quiz updated", "success");
        setQuizzes((prev) => prev.map((q: any) => (q.id === selectedItem.id ? { ...q, ...payload } : q)));
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
      const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.course?.title || item.courseName || "").toLowerCase().includes(searchTerm.toLowerCase());
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
        { key: "title", header: "Title", render: (q: any) => (<span className="text-sm font-medium text-gray-900">{q.title}</span>) },
        { key: "courseName", header: "Course", render: (q: any) => (<span className="text-sm text-gray-900">{q.courseName || '-'}</span>) },
        { key: "sectionName", header: "Section", render: (q: any) => (<span className="text-sm text-gray-900">{q.sectionName || '-'}</span>) },
        { key: "isLocked", header: "Locked", render: (q: any) => (<span className="text-sm text-gray-900">{q.isLocked ? 'Yes' : 'No'}</span>) },
        { key: "isPaid", header: "Paid", render: (q: any) => (<span className="text-sm text-gray-900">{q.isPaid ? 'Yes' : 'No'}</span>) },
        { key: "price", header: "Price", render: (q: any) => (<span className="text-sm text-gray-900">{typeof q.price === 'number' ? `$${q.price}` : '-'}</span>) },
        { key: "actions", header: "Actions", render: (q: any) => (
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
            <Button size="sm" variant="ghost" onClick={() => openViewModal(q)} className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start">View</Button>
            <Button size="sm" variant="ghost" onClick={() => openEditModal(q)} className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => openDeleteModal(q)} className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start">Delete</Button>
          </div>
        ) },
      ]}
      rows={paginated as any}
      getRowKey={(row: any) => row.id}
      page={page}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={setPage}
    />
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Quizzes</h1>
              <p className="text-sm md:text-base text-gray-600">Manage course quizzes</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              <span className="hidden sm:inline">Add Quiz</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input type="text" placeholder={`Search quizzes...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearchTerm(""); }} className="w-full">Clear Filters</Button>
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
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); resetForm(); }}
          title={isAddModalOpen ? "Add Quiz" : "Edit Quiz"}
          size="lg"
        >
          <div className="space-y-4">
            <QuizzesForm formData={formData} onChange={handleInputChange} setFormData={setFormData} courses={courses as any} sections={sections as any} />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); resetForm(); }}>Cancel</Button>
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit}>{isAddModalOpen ? "Add" : "Save Changes"}</Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedItem(null); }}
          title={`Quiz Details`}
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedItem).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</label>
                    <p className="text-sm text-gray-900">{typeof value === "string" || typeof value === "number" ? value.toString() : Array.isArray(value) ? `${value.length} items` : "N/A"}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => { setIsViewModalOpen(false); setSelectedItem(null); }}>Close</Button>
              </div>
            </div>
          )}
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedItem(null); }}
          onConfirm={handleDelete}
          title={`Delete Quiz`}
          message={`Are you sure you want to delete this quiz? This action cannot be undone.`}
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />
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
