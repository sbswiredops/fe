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

import LessonsForm from "../components/LessonsForm";
import LessonsTable from "../components/LessonsTable";
import TabsNav from "../components/TabsNav";

import { sectionService } from "@/services/sectionService";
import { lessonService } from "@/services/lessonService";
import type { Section } from "@/types/api";

function LessonsManagement() {
  const { showToast, ToastContainer } = useToast();

  // Removed client-side lessons list; rely on server-backed table
  const [sections, setSections] = React.useState<Section[]>([]);
  const [refreshTick, setRefreshTick] = React.useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

  // Prefetch sections for select options (global API)
  React.useEffect(() => {
    const load = async () => {
      if (!serverEnabled) return;
      try {
        const resAny: any = await sectionService.listAll({
          page: 1,
          limit: 1000,
        });
        const secs: any[] = Array.isArray(resAny?.data)
          ? resAny.data
          : Array.isArray(resAny?.data?.sections)
          ? resAny.data.sections
          : Array.isArray(resAny?.sections)
          ? resAny.sections
          : [];
        const mapped = secs.map((s: any) => ({
          ...s,
          courseId: s?.course?.id,
          courseName: s?.course?.title || s?.course?.name || "",
        }));
        setSections(mapped as any);
      } catch {}
    };
    load();
  }, [serverEnabled, refreshTick]);

  // ...existing code...
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as HTMLInputElement & { files?: FileList };
    const { name } = target;
    if (target.type === "file" && target.files) {
      const file = target.files[0];
      setFormData((prev: any) => ({ ...prev, [name]: file }));
      return;
    }
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

  const handleAdd = async () => {
    try {
      const payload: any = {
        sectionId: formData.sectionId,
        title: formData.title,
        content: formData.content,
        duration: formData.duration
          ? parseInt(formData.duration as any, 10)
          : 0,
        orderIndex: formData.orderIndex
          ? parseInt(formData.orderIndex as any, 10)
          : 0,
        isPublished: !!formData.isPublished,
        isFree: !!formData.isFree,
        videoUrl:
          formData.videoUrl instanceof File ? formData.videoUrl : undefined,
        resourceUrl:
          formData.resourceUrl instanceof File
            ? formData.resourceUrl
            : undefined,
      };
      const res = await lessonService.createLesson(formData.sectionId, payload);
      if (res.success) {
        showToast("Lesson created", "success");
        setRefreshTick((x) => x + 1); // trigger table reload
      } else {
        showToast(res.error || "Failed to create lesson", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to create lesson", "error");
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const payload: any = {
        title: formData.title,
        content: formData.content,
        duration: formData.duration
          ? parseInt(formData.duration as any, 10)
          : undefined,
        orderIndex: formData.orderIndex
          ? parseInt(formData.orderIndex as any, 10)
          : undefined,
        isPublished:
          typeof formData.isPublished === "boolean"
            ? formData.isPublished
            : undefined,
        isFree:
          typeof formData.isFree === "boolean" ? formData.isFree : undefined,
        videoUrl:
          formData.videoUrl instanceof File ? formData.videoUrl : undefined,
        resourceUrl:
          formData.resourceUrl instanceof File
            ? formData.resourceUrl
            : undefined,
      };
      const res = await lessonService.updateLesson(selectedItem.id, payload);
      if (res.success) {
        showToast("Lesson updated", "success");
        setRefreshTick((x) => x + 1); // trigger table reload
      } else {
        showToast(res.error || "Failed to update lesson", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update lesson", "error");
    }
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await lessonService.deleteLesson(selectedItem.id);
      if (res.success) {
        showToast("Lesson deleted", "success");
        setRefreshTick((x) => x + 1); // trigger table reload
      } else {
        showToast(res.error || "Failed to delete lesson", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete lesson", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Lessons
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Manage lessons for sections
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
              <span className="hidden sm:inline">Add Lesson</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder={`Search lessons...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Published</option>
                <option value="inactive">Draft</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full table-container">
            <div className="min-w-[320px] sm:min-w-[600px] lg:min-w-[900px]">
              <LessonsTable
                searchTerm={searchTerm}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                deps={[statusFilter, refreshTick]}
              />
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedItem(null);
            resetForm();
          }}
          title={isAddModalOpen ? "Add Lesson" : "Edit Lesson"}
          size="lg"
        >
          <div className="space-y-4">
            <LessonsForm
              formData={formData}
              onChange={handleInputChange}
              setFormData={setFormData}
              sections={sections as any}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
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

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
          }}
          title={`Lesson Details`}
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedItem).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <p className="text-sm text-gray-900">
                      {typeof value === "string" || typeof value === "number"
                        ? value.toString()
                        : "N/A"}
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={handleDelete}
          title={`Delete Lesson`}
          message={`Are you sure you want to delete this lesson? This action cannot be undone.`}
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default function LessonsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <LessonsManagement />
    </ProtectedRoute>
  );
}
