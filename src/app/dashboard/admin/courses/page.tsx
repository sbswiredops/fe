/* eslint-disable react-hooks/exhaustive-deps */
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

import CoursesForm from "./components/CoursesForm";
import CoursesServerTable from "./components/CoursesServerTable";
import TabsNav from "./components/TabsNav";

import CourseService from "@/services/courseService";
import { categoryService } from "@/services/categoryService";
import type { Course, Category } from "@/types/api";

function getLevelColor(level: string) {
  switch ((level || "").toUpperCase()) {
    case "BEGINNER":
      return "bg-green-100 text-green-800";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-800";
    case "ADVANCED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusColor(status: string) {
  switch ((status || "").toLowerCase()) {
    case "published":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "archived":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function CoursesManagement() {
  const { showToast, ToastContainer } = useToast();

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
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
  }, [searchTerm, statusFilter, courses]);

  // Try to fetch active categories for the form select
  React.useEffect(() => {
    const load = async () => {
      try {
        if (!serverEnabled) return; // Remove this line if you want to load categories even without BASE_URL
        const res = await categoryService.getActiveCategories({
          page: 1,
          limit: 100,
        });

        if (res?.success) {
          // Handle both array and paginated response shapes
          let list: Category[] = [];
          if (Array.isArray(res.data)) {
            list = res.data as Category[];
          } else if (
            res.data &&
            Array.isArray((res.data as { items?: Category[] }).items)
          ) {
            list = (res.data as { items: Category[] }).items;
          }

          setCategories(list);
        } else {
          showToast(res?.error || "Failed to load categories", "error");
        }
      } catch (err: any) {
        showToast(err?.message || "Failed to load categories", "error");
      }
    };
    load();
  }, [serverEnabled]);

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
      // Helpers
      const toNumber = (v: any) =>
        v === undefined || v === "" || v === null ? undefined : Number(v);

      const toArray = (v: any) => {
        if (Array.isArray(v))
          return v.map((s) => String(s).trim()).filter(Boolean);
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed))
              return parsed.map((s) => String(s).trim());
          } catch {}
          return v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return undefined;
      };

      // Build payload with correct types
      const payload: any = {
        title: String(formData.title || ""),
        description: String(formData.description || ""),
        shortDescription: formData.shortDescription
          ? String(formData.shortDescription)
          : undefined,
        categoryId: formData.categoryId
          ? String(formData.categoryId)
          : undefined,
        price: toNumber(formData.price) ?? 0,
        duration: toNumber(formData.duration) ?? 0,
        level: formData.level
          ? String(formData.level).toLowerCase()
          : "beginner",
        isPublished: Boolean(formData.isPublished),
        isFeatured: Boolean(formData.isFeatured),
        type: formData.type ? String(formData.type) : undefined,
        tags: toArray(formData.tags),
        requirements: toArray(formData.requirements),
        learningOutcomes: toArray(formData.learningOutcomes),
        discountPrice: toNumber(formData.discountPrice),
        discountPercentage: toNumber(formData.discountPercentage),
        total: toNumber(formData.total),
        thumbnail:
          formData.thumbnail instanceof File ? formData.thumbnail : undefined,
      };

      // Remove undefined keys so service gets a clean object.
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      console.log("Creating course with payload:", payload);

      // Let the service detect File fields and build FormData when necessary
      const res = await CourseService.createCourse(payload);

      console.log("Create course response:", res);
      if (res.success) {
        showToast("Course created", "success");
        if (res.data) setCourses((p) => [res.data as any, ...p]);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to create course", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to create course", "error");
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const toNumber = (v: any) =>
        v === undefined || v === "" || v === null ? undefined : Number(v);

      const toArray = (v: any) => {
        if (Array.isArray(v))
          return v.map((s) => String(s).trim()).filter(Boolean);
        if (typeof v === "string")
          return v
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        return undefined;
      };

      const payload: any = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        categoryId: formData.categoryId || undefined,
        price:
          toNumber(formData.price) !== undefined
            ? toNumber(formData.price)
            : undefined,
        duration:
          toNumber(formData.duration) !== undefined
            ? parseInt(String(toNumber(formData.duration)), 10)
            : undefined,
        level: formData.level
          ? String(formData.level).toLowerCase()
          : undefined,
        isPublished:
          typeof formData.isPublished === "boolean"
            ? formData.isPublished
            : formData.isPublished === undefined
            ? undefined
            : !!formData.isPublished,
        isFeatured:
          typeof formData.isFeatured === "boolean"
            ? formData.isFeatured
            : formData.isFeatured === undefined
            ? undefined
            : !!formData.isFeatured,
        type: formData.type || undefined,
        tags: toArray(formData.tags),
        requirements: toArray(formData.requirements),
        learningOutcomes: toArray(formData.learningOutcomes),
        discountPrice:
          toNumber(formData.discountPrice) !== undefined
            ? toNumber(formData.discountPrice)
            : undefined,
        discountPercentage:
          toNumber(formData.discountPercentage) !== undefined
            ? toNumber(formData.discountPercentage)
            : undefined,
        total:
          toNumber(formData.total) !== undefined
            ? toNumber(formData.total)
            : undefined,
        thumbnail:
          formData.thumbnail instanceof File ? formData.thumbnail : undefined,
      };

      // Prepare body: send JSON when no file, otherwise FormData with individual fields
      let bodyToSend: any = payload;
      if (payload.thumbnail instanceof File) {
        const fd = new FormData();
        fd.append("thumbnail", payload.thumbnail);
        // append other fields individually (no "data" wrapper)
        const dataCopy: any = { ...payload, thumbnail: undefined };
        Object.keys(dataCopy).forEach(
          (k) => dataCopy[k] === undefined && delete dataCopy[k]
        );
        fd.append("data", JSON.stringify(dataCopy));
        bodyToSend = fd;
      } else {
        Object.keys(bodyToSend).forEach(
          (k) => bodyToSend[k] === undefined && delete bodyToSend[k]
        );
      }

      const res = await CourseService.updateCourse(selectedItem.id, bodyToSend);
      if (res.success) {
        showToast("Course updated", "success");
        setCourses((prev) =>
          prev.map((c: any) =>
            c.id === selectedItem.id ? { ...c, ...payload } : c
          )
        );
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update course", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update course", "error");
    }
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await CourseService.deleteCourse(selectedItem.id);
      if (res.success) {
        showToast("Course deleted", "success");
        setCourses((prev) => prev.filter((c: any) => c.id !== selectedItem.id));
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to delete course", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete course", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const filtered = React.useMemo(() => {
    return courses.filter((item: any) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.instructor || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter ||
        (typeof item.isPublished === "boolean" &&
          ((statusFilter === "published" && item.isPublished) ||
            (statusFilter === "draft" && !item.isPublished)));
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const totalItems = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

  const renderClientTable = () => (
    <DataTable
      columns={[
        {
          key: "title",
          header: "Course",
          render: (course: any) => (
            <div>
              <div className="text-sm font-medium text-gray-900">
                {course.title}
              </div>
              <div className="text-sm text-gray-500">
                {course.duration} •{" "}
                {(course.sectionCount ?? course.totalLessons) || 0} sections
              </div>
            </div>
          ),
        },
        {
          key: "categoryName",
          header: "Category",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {c.category?.name || c.categoryName}
            </span>
          ),
        },
        {
          key: "instructor",
          header: "Instructor",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {c.instructor?.name || c.instructor}
            </span>
          ),
        },
        {
          key: "courseType",
          header: "Type",
          render: (c: any) => (
            <span className="text-sm text-gray-900">{c.courseType || "-"}</span>
          ),
        },
        {
          key: "price",
          header: "Price",
          render: (c: any) => (
            <span className="text-sm text-gray-900">${c.price}</span>
          ),
        },
        {
          key: "discountPrice",
          header: "Discount",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {typeof c.discountPrice === "number"
                ? `$${c.discountPrice}`
                : "-"}
            </span>
          ),
        },
        {
          key: "discountPercentage",
          header: "Percentage",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {typeof c.discountPercentage === "number"
                ? `${c.discountPercentage}%`
                : "-"}
            </span>
          ),
        },
        {
          key: "total",
          header: "Total",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {typeof c.total === "number" ? c.total : "-"}
            </span>
          ),
        },
        {
          key: "level",
          header: "Level",
          render: (c: any) => (
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                c.level
              )}`}
            >
              {c.level?.charAt(0).toUpperCase() + c.level?.slice(1)}
            </span>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (c: any) => {
            const label =
              typeof c.isPublished === "boolean"
                ? c.isPublished
                  ? "Published"
                  : "Draft"
                : c.status?.charAt(0).toUpperCase() + c.status?.slice(1);
            const colorKey =
              typeof c.isPublished === "boolean"
                ? c.isPublished
                  ? "published"
                  : "draft"
                : c.status || "draft";
            return (
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  colorKey
                )}`}
              >
                {label}
              </span>
            );
          },
        },
        {
          key: "enrollments",
          header: "Enrollments",
          render: (c: any) => (
            <span className="text-sm text-gray-900">
              {c.enrollmentCount ?? c.enrollments}
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
                Courses
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Manage courses
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
              <span className="hidden sm:inline">Add Course</span>
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
                placeholder={`Search courses...`}
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
                className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all" className="text-gray-900">
                  All Status
                </option>
                <option value="draft" className="text-yellow-800">
                  Draft
                </option>
                <option value="published" className="text-green-800">
                  Published
                </option>
                <option value="archived" className="text-gray-800">
                  Archived
                </option>
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
              {serverEnabled ? (
                <CoursesServerTable
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
          title={isAddModalOpen ? "Add Course" : "Edit Course"}
          size="lg"
        >
          <div className="space-y-4">
            <CoursesForm
              formData={formData}
              onChange={handleInputChange}
              setFormData={setFormData}
              categories={categories as any}
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
          title={`Course Details`}
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
                  variant="danger"
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
          title={`Delete Course`}
          message={`Are you sure you want to delete this course? This action cannot be undone.`}
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default function CoursesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CoursesManagement />
    </ProtectedRoute>
  );
}
