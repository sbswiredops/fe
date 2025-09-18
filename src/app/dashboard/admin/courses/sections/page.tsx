"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import useToast from "@/components/hoock/toast";
import { API_CONFIG } from "@/lib/config";

import SectionsForm from "../components/SectionsForm";
import SectionsTable from "../components/SectionsTable";
import TabsNav from "../components/TabsNav";
import { getStatusColor } from "../components/AdminUtils";

import CourseService from "@/services/courseService";
import { sectionService } from "@/services/sectionService";
import type { Section, Course } from "@/types/api";

function SectionsManagement() {
  const { showToast, ToastContainer } = useToast();

  const [sections, setSections] = React.useState<Section[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [refreshTick, setRefreshTick] = React.useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sections]);

  // Fetch courses for the form select
  React.useEffect(() => {
    const load = async () => {
      if (!serverEnabled) return;
      try {
        const anyRes: any = await CourseService.getCourses({ page: 1, limit: 100 });
        const courseArr: any[] = Array.isArray(anyRes?.data)
          ? anyRes.data
          : (Array.isArray(anyRes?.data?.courses) ? anyRes.data.courses : (Array.isArray(anyRes?.courses) ? anyRes.courses : []));
        setCourses(courseArr as any);
      } catch {}
    };
    load();
  }, [serverEnabled, refreshTick]);

  // Fetch sections (prefer new GET API, fallback to per-course aggregation)
  React.useEffect(() => {
    const loadSections = async () => {
      if (!serverEnabled) return;
      try {
        const resAny: any = await sectionService.listAll({ page: 1, limit: 1000 });
        const arr: any[] = Array.isArray(resAny?.data)
          ? resAny.data
          : (Array.isArray(resAny?.data?.sections) ? resAny.data.sections : (Array.isArray(resAny?.sections) ? resAny.sections : []));
        if (arr.length > 0) {
          const mapped = (arr as any[]).map((s: any) => ({
            ...s,
            courseId: s?.course?.id,
            courseName: s?.course?.title || s?.course?.name || '',
            lessonCount: Array.isArray(s?.lessons) ? s.lessons.length : (s?.lessonCount ?? 0),
            status: typeof s?.status === 'boolean' ? (s.status ? 'active' : 'inactive') : (s?.status || 'active'),
          }));
          setSections(mapped as any);
          return;
        }
      } catch {}

      if (courses.length === 0) return;
      const all: any[] = [];
      for (const c of courses as any[]) {
        try {
          const res: any = await sectionService.listByCourse(c.id, { page: 1, limit: 500 });
          const secs: any[] = Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.data?.sections) ? res.data.sections : (Array.isArray(res?.sections) ? res.sections : []));
          if (secs.length) {
            const mapped = secs.map((s: any) => ({
              ...s,
              courseId: c.id,
              courseName: c.title || c.name,
              status: s?.status || 'active',
              lessonCount: s?.lessonCount ?? 0,
            }));
            all.push(...mapped);
          }
        } catch {}
      }
      setSections(all as any);
    };
    loadSections();
  }, [serverEnabled, courses, refreshTick]);

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
      const payload = {
        title: formData.title,
        description: formData.description,
        order: parseInt(formData.order, 10) || 0,
      } as any;
      const res = await sectionService.createSection(formData.courseId, payload);
      if (res.success) {
        showToast("Section created", "success");
        const course = courses.find((c: any) => c.id === formData.courseId);
        const newItem: any = {
          id: (res.data as any)?.id,
          title: payload.title,
          description: payload.description,
          order: payload.order,
          status: "active",
          lessonCount: 0,
          createdAt: new Date().toISOString(),
          courseId: formData.courseId,
          courseName: course?.title || "",
        };
        setSections((p) => [newItem, ...p]);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to create section", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to create section", "error");
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        order: formData.order ? parseInt(formData.order, 10) : undefined,
      } as any;
      const res = await sectionService.updateSection(selectedItem.id, payload);
      if (res.success) {
        showToast("Section updated", "success");
        setSections((prev) => prev.map((s: any) => (s.id === selectedItem.id ? { ...s, ...payload } : s)));
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update section", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update section", "error");
    }
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await sectionService.deleteSection(selectedItem.id);
      if (res.success) {
        showToast("Section deleted", "success");
        setSections((prev) => prev.filter((s: any) => s.id !== selectedItem.id));
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to delete section", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete section", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const filtered = React.useMemo(() => {
    return sections.filter((item: any) => {
      const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.courseName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sections, searchTerm, statusFilter]);

  const totalItems = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Sections</h1>
              <p className="text-sm md:text-base text-gray-600">Manage course sections</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              <span className="hidden sm:inline">Add Section</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input type="text" placeholder={`Search sections...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="w-full">Clear Filters</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full table-container">
            <div className="min-w-[320px] sm:min-w-[600px] lg:min-w-[900px]">
              <SectionsTable
                rows={paginated as any}
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); resetForm(); }}
          title={isAddModalOpen ? "Add Section" : "Edit Section"}
          size="lg"
        >
          <div className="space-y-4">
            <SectionsForm formData={formData} onChange={handleInputChange} courses={courses as any} />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); resetForm(); }}>Cancel</Button>
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit}>{isAddModalOpen ? "Add" : "Save Changes"}</Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedItem(null); }}
          title={`Section Details`}
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedItem).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</label>
                    <p className="text-sm text-gray-900">{typeof value === "string" || typeof value === "number" ? value.toString() : "N/A"}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => { setIsViewModalOpen(false); setSelectedItem(null); }}>Close</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedItem(null); }}
          onConfirm={handleDelete}
          title={`Delete Section`}
          message={`Are you sure you want to delete this section? This action cannot be undone.`}
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default function SectionsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <SectionsManagement />
    </ProtectedRoute>
  );
}
