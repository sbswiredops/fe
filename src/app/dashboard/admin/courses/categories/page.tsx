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

import CategoriesForm from "../components/CategoriesForm";
import CategoriesServerTable from "../components/CategoriesServerTable";
import TabsNav from "../components/TabsNav";
import { getStatusColor } from "../components/AdminUtils";

import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/api";

function CategoriesManagement() {
  const { showToast, ToastContainer } = useToast();

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

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
      const derivedStatus = typeof formData.isActive === "boolean"
        ? (formData.isActive ? "active" : "inactive")
        : (formData.status || "active");

      const res = await categoryService.createCategory({
        name: formData.name,
        description: formData.description,
        status: derivedStatus,
        isActive: derivedStatus === "active",
      } as any);
      if (res.success) {
        showToast("Category created", "success");
        if (res.data) setCategories((p) => [res.data as any, ...p]);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to create category", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to create category", "error");
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const derivedStatus = typeof formData.isActive === "boolean"
        ? (formData.isActive ? "active" : "inactive")
        : (formData.status || undefined);

      const res = await categoryService.updateCategory(selectedItem.id, {
        name: formData.name,
        description: formData.description,
        status: derivedStatus,
        isActive: typeof derivedStatus === "string" ? derivedStatus === "active" : undefined,
      } as any);
      if (res.success) {
        showToast("Category updated", "success");
        if (res.data) {
          setCategories((prev) =>
            prev.map((c: any) => (c.id === selectedItem.id ? { ...c, ...res.data } : c))
          );
        }
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update category", "error");
      }
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
        setCategories((prev) => prev.filter((c: any) => c.id !== selectedItem.id));
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
      const matchesSearch = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
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
        { key: "name", header: "Name", render: (c: any) => (
          <span className="text-sm font-medium text-gray-900">{c.name}</span>
        ) },
        { key: "description", header: "Description", render: (c: any) => (
          <span className="text-sm text-gray-900 max-w-xs truncate block">{c.description}</span>
        ) },
        { key: "courseCount", header: "Courses", render: (c: any) => (
          <span className="text-sm text-gray-900">{c.courseCount}</span>
        ) },
        { key: "status", header: "Status", render: (c: any) => (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(c.status)}`}>
            {String(c.status || "").charAt(0).toUpperCase() + String(c.status || "").slice(1)}
          </span>
        ) },
        { key: "createdAt", header: "Created", render: (c: any) => (
          <span className="text-sm text-gray-900">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</span>
        ) },
        { key: "actions", header: "Actions", render: (c: any) => (
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
            <Button size="sm" variant="ghost" onClick={() => openViewModal(c)} className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start">View</Button>
            <Button size="sm" variant="ghost" onClick={() => openEditModal(c)} className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => openDeleteModal(c)} className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start">Delete</Button>
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Categories</h1>
              <p className="text-sm md:text-base text-gray-600">Manage course categories</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input type="text" placeholder={`Search categories...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); resetForm(); }}
          title={isAddModalOpen ? "Add Category" : "Edit Category"}
          size="lg"
        >
          <div className="space-y-4">
            <CategoriesForm formData={formData} onChange={handleInputChange} setFormData={setFormData} />
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
          title={`Category Details`}
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
