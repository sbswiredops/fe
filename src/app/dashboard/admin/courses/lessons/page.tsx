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
  const [pdfPreviewUrl, setPdfPreviewUrl] = React.useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const [resourcePreviewUrl, setResourcePreviewUrl] = React.useState<
    string | null
  >(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

  const resolveFileUrl = React.useCallback((url?: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base =
      (API_CONFIG as any)?.FILE_BASE_URL || API_CONFIG.BASE_URL || "";
    if (!base) return url;
    const trimmedBase = base.replace(/\/+$/, "");
    const trimmedUrl = url.replace(/^\/+/, "");
    return `${trimmedBase}/${trimmedUrl}`;
  }, []);

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
    cleanupPdfObjectUrl();
    setPdfPreviewUrl(null);
    setPdfError(null);
    setResourcePreviewUrl(null);
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
        video:
          formData.video instanceof File
            ? formData.video
            : formData.video || undefined,
        resource:
          formData.resource instanceof File
            ? formData.resource
            : formData.resource || undefined,
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
        video: formData.video instanceof File ? formData.video : undefined,
        resource:
          formData.resource instanceof File ? formData.resource : undefined,
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

  const pdfObjectUrlRef = React.useRef<string | null>(null);
  const cleanupPdfObjectUrl = React.useCallback(() => {
    if (pdfObjectUrlRef.current) {
      URL.revokeObjectURL(pdfObjectUrlRef.current);
      pdfObjectUrlRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!isViewModalOpen || !selectedItem?.id || !serverEnabled) return;
    let cancelled = false;

    const loadPdf = async () => {
      setIsPdfLoading(true);
      setPdfError(null);
      try {
        const blob = await lessonService.getLessonPdfBlob(selectedItem.id);
        if (cancelled) return;
        cleanupPdfObjectUrl();
        const objectUrl = URL.createObjectURL(blob);
        pdfObjectUrlRef.current = objectUrl;
        setPdfPreviewUrl(objectUrl);
      } catch (error: any) {
        if (cancelled) return;
        const status = error?.response?.status ?? error?.status;
        if (status === 404) {
          setPdfError("PDF not available for this lesson.");
        } else {
          setPdfError(error?.message || "Failed to load lesson PDF.");
        }
        setPdfPreviewUrl(null);
      } finally {
        if (!cancelled) {
          setIsPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      cleanupPdfObjectUrl();
    };
  }, [isViewModalOpen, selectedItem?.id, serverEnabled, cleanupPdfObjectUrl]);

  const handleResourcePreview = React.useCallback(
    (resourceUrl: string) => {
      const resolved = resolveFileUrl(resourceUrl);
      if (!resolved) {
        setResourcePreviewUrl(null);
        return;
      }
      setResourcePreviewUrl(resolved);
    },
    [resolveFileUrl]
  );

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
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder={`Search lessons...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900 h-12"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Published</option>
                <option value="inactive">Draft</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-transparent mb-1 select-none">
                Clear
              </label>
              <Button
                variant="dangerOutline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedItem(null);
            cleanupPdfObjectUrl();
            setPdfPreviewUrl(null);
            setPdfError(null);
            setIsPdfLoading(false);
            setResourcePreviewUrl(null);
          }}
          title={`Lesson Details`}
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(isPdfLoading || pdfPreviewUrl || pdfError) && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Lesson PDF
                    </label>
                    {isPdfLoading && (
                      <p className="text-sm text-gray-500">
                        Loading PDF preview...
                      </p>
                    )}
                    {!isPdfLoading && pdfError && (
                      <p className="text-sm text-red-500">{pdfError}</p>
                    )}
                    {!isPdfLoading && pdfPreviewUrl && (
                      <>
                        <div className="w-full h-[480px] border border-gray-200 rounded-lg overflow-hidden">
                          <iframe
                            src={`${pdfPreviewUrl}#toolbar=0`}
                            className="w-full h-full"
                            title="Lesson PDF Preview"
                          />
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <a
                            href={pdfPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#51356e] underline"
                          >
                            Open in new tab
                          </a>
                          <a
                            href={pdfPreviewUrl}
                            download={
                              selectedItem?.title
                                ? `${selectedItem.title}.pdf`
                                : true
                            }
                            className="text-[#51356e] underline"
                          >
                            Download PDF
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {resourcePreviewUrl && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Resource Preview
                    </label>
                    <div className="w-full h-[480px] border border-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={resourcePreviewUrl}
                        className="w-full h-full"
                        title="Lesson Resource Preview"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a
                        href={resourcePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#51356e] underline"
                      >
                        Open in new tab
                      </a>
                      <a
                        href={resourcePreviewUrl}
                        download
                        className="text-[#51356e] underline"
                      >
                        Download Resource
                      </a>
                      <button
                        type="button"
                        onClick={() => setResourcePreviewUrl(null)}
                        className="text-sm text-red-500 underline"
                      >
                        Close preview
                      </button>
                    </div>
                  </div>
                )}
                {Object.entries(selectedItem).map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, " $1").trim();
                  if (
                    key === "video" &&
                    typeof value === "string" &&
                    value !== "undefined"
                  ) {
                    return (
                      <div key={key} className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {label}
                        </label>
                        <video
                          controls
                          preload="metadata"
                          className="w-full rounded-lg border border-gray-200 bg-black"
                        >
                          <source src={value} type="application/x-mpegURL" />
                          <source src={value} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  }

                  if (
                    key === "resource" &&
                    typeof value === "string" &&
                    value &&
                    value !== "undefined"
                  ) {
                    const resolvedUrl = resolveFileUrl(value);
                    const isPdfResource = /\.pdf($|\?)/i.test(
                      value.split("?")[0] || ""
                    );
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {label}
                        </label>
                        {isPdfResource ? (
                          <div className="flex flex-wrap gap-4 text-sm">
                            <button
                              type="button"
                              onClick={() => handleResourcePreview(value)}
                              className="text-[#51356e] underline"
                            >
                              Preview Resource
                            </button>
                            {resolvedUrl && (
                              <>
                                <a
                                  href={resolvedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#51356e] underline"
                                >
                                  Open in new tab
                                </a>
                                <a
                                  href={resolvedUrl}
                                  download
                                  className="text-[#51356e] underline"
                                >
                                  Download
                                </a>
                              </>
                            )}
                          </div>
                        ) : resolvedUrl ? (
                          <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#51356e] underline break-all"
                          >
                            View Resource
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Resource unavailable.
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {label}
                        </label>
                        <p className="text-sm text-gray-900 break-words">
                          {value.length ? value.join(", ") : "N/A"}
                        </p>
                      </div>
                    );
                  }

                  if (typeof value === "boolean") {
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {label}
                        </label>
                        <p className="text-sm text-gray-900">
                          {value ? "Yes" : "No"}
                        </p>
                      </div>
                    );
                  }

                  if (value && typeof value === "object") {
                    const formatted =
                      (value as any)?.title ||
                      (value as any)?.name ||
                      (value as any)?.label ||
                      (value as any)?.id ||
                      JSON.stringify(value, null, 2);
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {label}
                        </label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                          {formatted}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {label}
                      </label>
                      <p className="text-sm text-gray-900 break-words">
                        {value !== undefined &&
                        value !== null &&
                        value !== "undefined"
                          ? value.toString()
                          : "N/A"}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedItem(null);
                    cleanupPdfObjectUrl();
                    setPdfPreviewUrl(null);
                    setPdfError(null);
                    setIsPdfLoading(false);
                    setResourcePreviewUrl(null);
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
