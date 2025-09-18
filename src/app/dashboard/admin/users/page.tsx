"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import DataTable from "@/components/ui/DataTable";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  joinDate: string;
  lastLogin?: string;
}

function UsersManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-01-20",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@example.com",
      status: "inactive",
      joinDate: "2024-01-08",
      lastLogin: "2024-01-18",
    },
    {
      id: "5",
      name: "Emily Johnson",
      email: "emily@example.com",
      status: "active",
      joinDate: "2024-01-12",
      lastLogin: "2024-01-21",
    },
    {
      id: "6",
      name: "David Brown",
      email: "david@example.com",
      status: "active",
      joinDate: "2024-01-18",
      lastLogin: "2024-01-22",
    },
  ]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (p: number) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  const prevPage = () => goToPage(currentPage - 1);
  const nextPage = () => goToPage(currentPage + 1);

  const getPageNumbers = (): number[] => {
    const max = 5;
    const half = Math.floor(max / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + max - 1);

    // if we don’t have enough pages at the end, shift window left
    start = Math.max(1, Math.min(start, end - max + 1));

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen overflow-x-hidden">
        <div className="px-4 sm:px-6 py-6 max-w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
                  Students Management
                </h1>
                <p className="text-gray-600 break-words">
                  Manage and monitor all students in your platform
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full">
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
              <div className="w-full sm:col-span-2 lg:col-span-1 flex items-end">
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

          {/* Users Table (desktop) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hidden md:block">
            <DataTable<User>
              columns={[
                {
                  key: "name",
                  header: "User",
                  render: (user) => (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 break-all">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (user) => (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  ),
                },
                {
                  key: "joinDate",
                  header: "Join Date",
                  render: (user) => (
                    <span className="text-sm text-gray-900">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </span>
                  ),
                },
                {
                  key: "lastLogin",
                  header: "Last Login",
                  render: (user) => (
                    <span className="text-sm text-gray-900">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (user) => (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openViewModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              rows={paginatedUsers}
              getRowKey={(u) => u.id}
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={goToPage}
            />
          </div>

          {/* Users List (mobile) */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <h3 className="text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 break-all mt-1">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex px-2 py-1 text-[10px] font-medium rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-600">
                    Joined: {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    Last login: {" "}
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openViewModal(user)}
                    className="flex-1 min-w-0"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="!text-red-600 flex-1 min-w-0"
                    onClick={() => openDeleteModal(user)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile pagination */}
          {filteredUsers.length > 0 && (
            <div className="md:hidden mt-3 bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <span>
                    {startIndex + 1}-{endIndex} of {filteredUsers.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="w-full"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="w-full"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View User Modal */}
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedUser(null);
            }}
            title="Student Details"
            size="md"
          >
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600 break-all">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        selectedUser.status
                      )}`}
                    >
                      {selectedUser.status.charAt(0).toUpperCase() +
                        selectedUser.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Join Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedUser.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Login
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.lastLogin
                        ? new Date(selectedUser.lastLogin).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setSelectedUser(null);
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
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteUser}
            title="Delete Student"
            message={`Are you sure you want to delete student ${selectedUser?.name}? This action cannot be undone.`}
            type="danger"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <UsersManagement />
    </ProtectedRoute>
  );
}
