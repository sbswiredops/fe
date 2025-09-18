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
import CertificatesForm from "../components/CertificatesForm";
import CertificatesServerTable from "../components/CertificatesServerTable";

import CourseService from "@/services/courseService";
import { certificateService } from "@/services/certificateService";
import type { Course, Certificate } from "@/types/api";

function CertificatesManagement() {
  const { showToast, ToastContainer } = useToast();

  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [refreshTick, setRefreshTick] = React.useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({});

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCourseId, setFilterCourseId] = React.useState<string>("");
  const [filterUserId, setFilterUserId] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  const serverEnabled = (() => {
    const base = API_CONFIG.BASE_URL || "";
    return !!base;
  })();

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, filterCourseId, filterUserId, certificates]);

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
  const openEditModal = (item: any) => { setSelectedItem(item); setFormData({ userId: item.userId, courseId: item.courseId }); setIsEditModalOpen(true); };
  const openDeleteModal = (item: any) => { setSelectedItem(item); setIsDeleteModalOpen(true); };

  const handleAdd = async () => {
    try {
      const payload: any = {
        userId: formData.userId,
        courseId: formData.courseId,
      };
      const res = await certificateService.create(payload);
      if (res.success) {
        showToast("Certificate issued", "success");
        if (res.data) setCertificates((p) => [res.data as any, ...p]);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to issue certificate", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to issue certificate", "error");
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      const payload: any = {
        userId: formData.userId,
        courseId: formData.courseId,
      };
      const res = await certificateService.update(selectedItem.id, payload);
      if (res.success) {
        showToast("Certificate updated", "success");
        setCertificates((prev) => prev.map((c: any) => (c.id === selectedItem.id ? { ...c, ...payload } : c)));
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to update certificate", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update certificate", "error");
    }
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await certificateService.delete(selectedItem.id);
      if (res.success) {
        showToast("Certificate deleted", "success");
        setCertificates((prev) => prev.filter((c: any) => c.id !== selectedItem.id));
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res.error || "Failed to delete certificate", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete certificate", "error");
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const filtered = React.useMemo(() => {
    return certificates.filter((item: any) => {
      const matchesSearch = (item.certificateNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.course?.title || item.courseId || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [certificates, searchTerm]);

  const totalItems = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

  const renderClientTable = () => (
    <DataTable
      columns={[
        { key: "certificateNumber", header: "Number" },
        { key: "userId", header: "User" },
        { key: "courseId", header: "Course" },
        { key: "issuedAt", header: "Issued", render: (c: any) => (<span className="text-sm text-gray-900">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '-'}</span>) },
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Certificates</h1>
              <p className="text-sm md:text-base text-gray-600">Manage course certificates</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              <span className="hidden sm:inline">Add Certificate</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <TabsNav />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input type="text" placeholder={`Search certificates...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <Input label="User ID" type="text" placeholder="Filter by userId" value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} />
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterCourseId(""); setFilterUserId(""); }} className="w-full">Clear Filters</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full table-container">
            <div className="min-w-[320px] sm:min-w-[600px] lg:min-w-[900px]">
              {serverEnabled ? (
                <CertificatesServerTable
                  searchTerm={searchTerm}
                  courseId={filterCourseId || undefined}
                  userId={filterUserId || undefined}
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  deps={[filterCourseId, filterUserId, refreshTick]}
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
          title={isAddModalOpen ? "Add Certificate" : "Edit Certificate"}
          size="lg"
        >
          <div className="space-y-4">
            <CertificatesForm formData={formData} onChange={handleInputChange} setFormData={setFormData} courses={courses as any} />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); resetForm(); }}>Cancel</Button>
              <Button onClick={isAddModalOpen ? handleAdd : handleEdit}>{isAddModalOpen ? "Add" : "Save Changes"}</Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedItem(null); }}
          title={`Certificate Details`}
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

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedItem(null); }}
          onConfirm={handleDelete}
          title={`Delete Certificate`}
          message={`Are you sure you want to delete this certificate? This action cannot be undone.`}
          type="danger"
        />
      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default function CertificatesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <CertificatesManagement />
    </ProtectedRoute>
  );
}
