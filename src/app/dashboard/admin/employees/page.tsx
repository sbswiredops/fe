"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ServerDataTable from "@/components/ui/ServerDataTable";
import { userService } from "@/services/userService";
import useToast from "@/components/hoock/toast";

interface Teacher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  experience?: string;
  coursesCount?: number;
  studentsCount?: number;
  rating?: number;
  status: boolean | "active" | "inactive" | "suspended";
  role?: "teacher" | "admin" | string;
}

function EmployeesManagement() {
  const { showToast, ToastContainer } = useToast();
  const [refreshTick, setRefreshTick] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const toBoolStatus = (v: any) =>
    v === true || v === "active" || v === 1 || v === "1";
  const getStatusColor = (status: string | boolean) => {
    const isActive = toBoolStatus(status);
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };
  const getRatingStars = (rating: number) => {
    return "⭐".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "✨" : "");
  };

  // dynamic roles
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  React.useEffect(() => {
    const load = async () => {
      setRolesLoading(true);
      try {
        const res = await userService.listRoles();
        const raw = Array.isArray(res)
          ? res
          : (res as any)?.data ??
            (res as any)?.roles ??
            (res as any)?.data?.roles ??
            [];
        const names = (Array.isArray(raw) ? raw : [])
          .map((r: any) => r?.name ?? r?.role ?? r?.id ?? r)
          .map((s: any) => String(s))
          .filter(Boolean);
        setRoles(Array.from(new Set(names)));
      } catch (e: any) {
        showToast(e?.message || "Failed to load roles", "error");
      } finally {
        setRolesLoading(false);
      }
    };
    load();
  }, [showToast]);

  const defaultTeacherRole = React.useMemo(
    () => (roles.includes("teacher") ? "teacher" : roles[0] || ""),
    [roles]
  );

  // Form data state
  const [formData, setFormData] = useState<any>({});

  // Search and filter states (for teachers)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({});
  };

  const getFormFields = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleInputChange}
            placeholder="Enter first name"
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleInputChange}
            placeholder="Enter last name"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Specialization"
            name="specialization"
            value={formData.specialization || ""}
            onChange={handleInputChange}
            placeholder="e.g., Web Development"
            required
          />
          <Input
            label="Experience"
            name="experience"
            value={formData.experience || ""}
            onChange={handleInputChange}
            placeholder="e.g., 5 years"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role ?? defaultTeacherRole}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">
              {rolesLoading ? "Loading..." : "Select role"}
            </option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status || "active"}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </>
    );
  };

  const handleAdd = async () => {
    try {
      const password = Math.random().toString(36).slice(-12) + "A!1";
      const res = await userService.createAdminInstructor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        specialization: formData.specialization,
        experience: formData.experience,
        password,
        phone: formData.phone,
        role: formData.role || defaultTeacherRole || "teacher",
        status: formData.status || "active",
      });
      if (res.success) {
        showToast("Teacher created", "success");
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to create teacher", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to create teacher", "error");
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const res = await userService.update(selectedItem.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: formData.experience,
        status: formData.status,
        role: formData.role || "teacher",
      });
      if (res.success) {
        showToast("Teacher updated", "success");
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update teacher", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to update teacher", "error");
    }

    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await userService.remove(selectedItem.id);
      if (res.success) {
        showToast("Teacher deleted", "success");
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to delete teacher", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to delete teacher", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditModalOpen(true);
  };

  const openViewModal = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Teachers Management
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Manage teachers in your organization
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
              <span className="hidden sm:inline">Add Teacher</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search teachers..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                disabled={rolesLoading}
              >
                <option value="all">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setRoleFilter("all");
                }}
                className="w-full md:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <ServerDataTable<Teacher>
                columns={[
                  {
                    key: "teacher",
                    header: "Teacher",
                    render: (teacher: Teacher) => (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {teacher.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "specialization",
                    header: "Specialization",
                    render: (t: any) => (
                      <span className="text-sm text-gray-900">
                        {t.specialization || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "experience",
                    header: "Experience",
                    render: (t: any) => (
                      <span className="text-sm text-gray-900">
                        {t.experience || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "coursesCount",
                    header: "Courses",
                    render: (t: any) => (
                      <span className="text-sm text-gray-900">
                        {t.coursesCount ?? 0}
                      </span>
                    ),
                  },
                  {
                    key: "studentsCount",
                    header: "Students",
                    render: (t: any) => (
                      <span className="text-sm text-gray-900">
                        {t.studentsCount ?? 0}
                      </span>
                    ),
                  },
                  {
                    key: "rating",
                    header: "Rating",
                    render: (t: any) => (
                      <span className="text-sm text-gray-900">
                        {getRatingStars(t.rating || 0)} {t.rating || 0}
                      </span>
                    ),
                  },
                  {
                    key: "role",
                    header: "Role",
                    render: (t: any) => (
                      <span className="text-sm text-gray-900">
                        {t.role
                          ? t.role.charAt(0).toUpperCase() + t.role.slice(1)
                          : "—"}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (t: any) => (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          t.status
                        )}`}
                      >
                        {(t.status || "").toString().charAt(0).toUpperCase() +
                          (t.status || "").toString().slice(1)}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    render: (t: any) => (
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openViewModal(t)}
                          className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(t)}
                          className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(t)}
                          className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start"
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                getRowKey={(row) => (row as any).id}
                fetchPage={async ({ page, limit }) => {
                  const params: any = {
                    page,
                    limit,
                    search: searchTerm || undefined,
                    status: statusFilter === "all" ? undefined : statusFilter,
                  };
                  if (roleFilter !== "all") params.role = roleFilter;

                  const res = await userService.list({
                    ...(params as any),
                    role: (params as any).role || "teacher",
                  });

                  const users = Array.isArray(res)
                    ? res
                    : Array.isArray((res as any)?.data?.users)
                    ? (res as any).data.users
                    : Array.isArray((res as any)?.users)
                    ? (res as any).users
                    : Array.isArray((res as any)?.data)
                    ? (res as any).data
                    : [];

                  const total = Array.isArray(res)
                    ? res.length
                    : typeof (res as any)?.data?.total === "number"
                    ? (res as any).data.total
                    : typeof (res as any)?.meta?.total === "number"
                    ? (res as any).meta.total
                    : typeof (res as any)?.total === "number"
                    ? (res as any).total
                    : users.length;

                  return { rows: users, total };
                }}
                pageSize={8}
                deps={[searchTerm, statusFilter, roleFilter, refreshTick]}
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
          title={isAddModalOpen ? "Add Teacher" : "Edit Teacher"}
          size="lg"
        >
          <div className="space-y-4">
            {getFormFields()}
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
          title="Teacher Details"
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xl">
                    {selectedItem.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedItem.name}
                  </h3>
                  <p className="text-gray-600">{selectedItem.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (key === "id" || key === "name" || key === "email")
                    return null;
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <p className="text-sm text-gray-900">
                        {key === "rating"
                          ? `${getRatingStars(value as number)} ${value}`
                          : value?.toString() || "N/A"}
                      </p>
                    </div>
                  );
                })}
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
          title="Delete Teacher"
          message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`}
          type="danger"
        />
        <ToastContainer position="bottom-right" />
      </div>
    </DashboardLayout>
  );
}

export default function EmployeesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <EmployeesManagement />
    </ProtectedRoute>
  );
}
