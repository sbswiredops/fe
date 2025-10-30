/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import useToast from "@/components/hoock/toast";
import DataTable from "@/components/ui/DataTable";
import { API_CONFIG } from "@/lib/config";

import CategoriesForm from "../components/CategoriesForm";
import CategoriesServerTable from "../components/CategoriesServerTable";
import TabsNav from "../components/TabsNav";
import { getStatusColor } from "../components/AdminUtils";

import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/api";

function CategoriesManagement() {
  const { showToast, ToastContainer } = useToast();

  // resolve status string: prefer item.status, fallback to item.isActive
  const resolveStatusValue = (item: any) => {
    if (!item) return undefined;
    if (typeof item.status === "string" && item.status.trim() !== "")
      return item.status;
    if (typeof item.isActive === "boolean")
      return item.isActive ? "active" : "inactive";
    return undefined;
  };

  // normalize incoming item so we always have `avatar` field (maps categories_avatar -> avatar)
  const normalizeItem = (item: any) => {
    if (!item) return item;
    return {
      ...item,
      avatar:
        item.avatar ??
        item.categories_avatar ??
        (item as any).categoriesAvatar ??
        undefined,
    };
  };

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [refreshTick, setRefreshTick] = React.useState(0);

  // Modal + form states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});

  // Filters/pagination
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, categories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as HTMLInputElement & { files?: FileList };
    const name = target.name;

    // file input
    if (target.type === "file") {
      if (target.files && target.files.length > 0) {
        const value = (target as HTMLInputElement).multiple
          ? Array.from(target.files)
          : target.files[0];
        setFormData((prev: any) => ({ ...prev, [name]: value }));
      } else {
        setFormData((prev: any) => ({ ...prev, [name]: undefined }));
      }
      return;
    }

    if (target.type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }

    if (target.type === "number") {
      const raw = (target as HTMLInputElement).value;
      setFormData((prev: any) => ({
        ...prev,
        [name]: raw === "" ? undefined : Number(raw),
      }));
      return;
    }

    const value = (target as HTMLInputElement).value;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleAdd = async () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      avatar: formData.avatar,
      icon: formData.icon,
      isActive: formData.isActive ?? true, // default true
    };

    try {
      const res = await categoryService.createCategory(payload);

      if (res.success) {
        showToast("Category added successfully", "success");
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedItem.id ? { ...c, ...res.data } : c
          )
        );
        setRefreshTick((x) => x + 1);
        setIsAddModalOpen(false);
        resetForm();
      } else {
        showToast(res.message || "Failed to add category", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to add category", "error");
    }
  };

  const resetForm = () => setFormData({});

  // helper to resolve image src (handles string URLs and File objects)
  const objectUrlsRef = React.useRef<string[]>([]);
  const resolveSrc = (val: any) => {
    if (!val) return undefined;
    // handle API objects like { url: '...' }
    if (
      typeof val === "object" &&
      val !== null &&
      typeof (val as any).url === "string"
    ) {
      val = (val as any).url;
    }
    if (typeof val === "string") {
      const s = val.trim();
      return s === "" ? undefined : s;
    }
    if (val instanceof File) {
      const url = URL.createObjectURL(val);
      objectUrlsRef.current.push(url);
      return url;
    }
    return undefined;
  };

  // helper to determine if we should use next/Image (only use for absolute http(s) URLs)
  const isHttpUrl = (v?: string) =>
    typeof v === "string" && /^https?:\/\//i.test(v);

  // revoke any created object URLs when view modal closes or component unmounts
  React.useEffect(() => {
    if (!isViewModalOpen) {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    }
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    };
  }, [isViewModalOpen]);

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

  const openViewModal = (item: any) => {
    setSelectedItem(normalizeItem(item));
    setIsViewModalOpen(true);
  };
  const openEditModal = (item: any) => {
    const n = normalizeItem(item);
    setSelectedItem(n);
    // prefill formData with normalized item so avatar/icon previews use the current values
    setFormData({ ...n });
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      // Only send fields the API accepts. do NOT send `status` (API rejects it).
      const payload: any = {
        name: formData.name,
        description: formData.description,
      };

      if (formData.avatar instanceof File) {
        payload.avatar = formData.avatar;
      } else if (typeof formData.avatar === "string" && formData.avatar) {
        payload.avatar = formData.avatar;
      }

      if (formData.icon instanceof File) {
        payload.icon = formData.icon;
      } else if (typeof formData.icon === "string" && formData.icon) {
        payload.icon = formData.icon;
      }

      // send isActive (boolean) when provided — do not send `status` string
      if (typeof formData.isActive === "boolean") {
        payload.isActive = formData.isActive;
      }

      const res = await categoryService.updateCategory(
        selectedItem.id,
        payload as any
      );
      if (res.success) {
        showToast("Category updated", "success");
        if (res.data) {
          setCategories((prev) =>
            prev.map((c: any) =>
              c.id === selectedItem.id ? { ...c, ...res.data } : c
            )
          );
        }
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update category", "error");
      }

      // No follow-up patch: we send isActive as a form field in the initial request
    } catch (e: any) {
      showToast(e?.message || "Failed to update category", "error");
    }
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await categoryService.deleteCategory(selectedItem.id);
      if (res.success) {
        showToast("Category deleted", "success");
        setCategories((prev) =>
          prev.filter((c: any) => c.id !== selectedItem.id)
        );
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to delete category", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete category", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const filtered = React.useMemo(() => {
    return categories.filter((item: any) => {
      const matchesSearch = (item.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const resolvedStatus = resolveStatusValue(item);
      const matchesStatus =
        statusFilter === "all" || resolvedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const totalItems = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

  const renderClientTable = () => (
    <DataTable
      columns={[
        {
          key: "name",
          header: "Name",
          render: (c: any) => (
            <span className="text-sm font-medium text-gray-900">{c.name}</span>
          ),
        },
        {
          key: "description",
          header: "Description",
          render: (c: any) => (
            <span className="text-sm text-gray-900 max-w-xs truncate block">
              {c.description}
            </span>
          ),
        },
        {
          key: "courseCount",
          header: "Courses",
          render: (c: any) => (
            <span className="text-sm text-gray-900">{c.courseCount}</span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (c: any) =>
            (() => {
              const statusVal = resolveStatusValue(c);
              const label = statusVal
                ? statusVal.charAt(0).toUpperCase() + statusVal.slice(1)
                : "-";
              return (
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    statusVal
                  )}`}
                >
                  {label}
                </span>
              );
            })(),
        },
        {
          key: "createdAt",
          header: "Created",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
            </span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          render: (c: any) => (
            <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openViewModal(c)}
                className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start"
              >
                View
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditModal(c)}
                className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDeleteModal(c)}
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Categories
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Manage course categories
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
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder={`Search categories...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900 h-12"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
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
              {serverEnabled ? (
                <CategoriesServerTable
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
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

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedItem(null);
            resetForm();
          }}
          title={isAddModalOpen ? "Add Category" : "Edit Category"}
          size="lg"
        >
          <div className="space-y-4">
            {/* Preview existing avatar/icon when editing */}
            {isEditModalOpen && (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                  {(() => {
                    const avatarSrc = resolveSrc(
                      formData.avatar ??
                        selectedItem?.avatar ??
                        selectedItem?.categories_avatar
                    );
                    if (!avatarSrc)
                      return (
                        <div className="text-gray-400 text-sm">No Image</div>
                      );
                    if (isHttpUrl(avatarSrc)) {
                      return (
                        <Image
                          src={avatarSrc}
                          alt={selectedItem?.name || "avatar"}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                    return (
                      <img
                        src={avatarSrc}
                        alt={selectedItem?.name || "avatar"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}
                </div>

                <div className="w-12 h-12 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center bg-white">
                  {(() => {
                    const iconSrc = resolveSrc(
                      formData.icon ?? selectedItem?.icon
                    );
                    if (!iconSrc)
                      return <span className="text-gray-400 text-sm">N/A</span>;
                    if (isHttpUrl(iconSrc)) {
                      return (
                        <Image
                          src={iconSrc}
                          alt="icon"
                          width={40}
                          height={40}
                          className="w-full h-full object-contain p-1"
                        />
                      );
                    }
                    return (
                      <img
                        src={iconSrc}
                        alt="icon"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain p-1"
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            <CategoriesForm
              formData={formData}
              onChange={handleInputChange}
              setFormData={setFormData}
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
          }}
          title={`Category Details`}
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shadow">
                    {(() => {
                      const avatarSrc = resolveSrc(
                        selectedItem.avatar ?? selectedItem.categories_avatar
                      );
                      if (!avatarSrc)
                        return (
                          <div className="text-gray-400 text-sm">No Image</div>
                        );
                      if (isHttpUrl(avatarSrc)) {
                        return (
                          <Image
                            src={avatarSrc}
                            alt={selectedItem.name || "avatar"}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return (
                        <img
                          src={avatarSrc}
                          alt={selectedItem.name || "avatar"}
                          width={160}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      );
                    })()}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedItem.name || "-"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedItem.description || "-"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          resolveStatusValue(selectedItem)
                        )}`}
                      >
                        {(() => {
                          const s = resolveStatusValue(selectedItem);
                          return s
                            ? s.charAt(0).toUpperCase() + s.slice(1)
                            : "-";
                        })()}
                      </div>

                      <div className="w-12 h-12 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center bg-white">
                        {(() => {
                          const iconSrc = resolveSrc(selectedItem.icon);
                          if (!iconSrc)
                            return (
                              <span className="text-gray-400 text-sm">N/A</span>
                            );
                          if (isHttpUrl(iconSrc)) {
                            return (
                              <Image
                                src={iconSrc}
                                alt="icon"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain p-1"
                              />
                            );
                          }
                          return (
                            <img
                              src={iconSrc}
                              alt="icon"
                              width={40}
                              height={40}
                              className="w-full h-full object-contain p-1"
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Courses</div>
                      <div className="mt-1 text-gray-900">
                        {selectedItem.courseCount ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created</div>
                      <div className="mt-1 text-gray-900">
                        {selectedItem.createdAt
                          ? new Date(
                              selectedItem.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500">ID</div>
                      <div className="mt-1 break-all text-gray-900 text-sm">
                        {selectedItem.id ?? "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
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
          title={`Delete Category`}
          message={`Are you sure you want to delete this category? This action cannot be undone.`}
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CategoriesManagement />
    </ProtectedRoute>
  );
}
