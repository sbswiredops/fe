/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users as UsersIcon,
  Shield,
  Loader2,
} from "lucide-react";
import { getAllRoles, deleteRole, Role } from "@/services/roleService";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import CreateRoleModal from "./CreateRoleModal";
import EditRoleModal from "./EditRoleModal";
import RoleDetailsModal from "./RoleDetailsModal";
import useToast from "@/components/hoock/toast";

export default function RolesManagement() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getAllRoles();
      setRoles(response);
    } catch (error: any) {
      showToast(error.message || t("rolesManagement.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id);
      showToast(t("rolesManagement.deleteSuccess"), "success");
      loadRoles();
      setShowDeleteModal(false);
      setSelectedRole(null);
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          error.message ||
          t("rolesManagement.deleteError"),
        "error",
      );
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t("rolesManagement.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t("rolesManagement.createNewRole")}</span>
        </button>
      </div>

      {/* Roles Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{t("rolesManagement.noRolesFound")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("rolesManagement.name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("rolesManagement.description")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("rolesManagement.permissions")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("rolesManagement.users")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("rolesManagement.type")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("rolesManagement.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setShowDetailsModal(true);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {role.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {role.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.permissions.length}{" "}
                        {t("rolesManagement.countSuffix")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <UsersIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {role.users?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {role.isSystemRole ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Shield className="w-3 h-3 mr-1" />
                          {t("rolesManagement.system")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t("rolesManagement.custom")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowEditModal(true);
                          }}
                          disabled={role.isSystemRole}
                          className={`p-2 rounded-lg transition-colors ${
                            role.isSystemRole
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                          title={
                            role.isSystemRole
                              ? t("rolesManagement.cannotEditSystemRole")
                              : t("rolesManagement.edit")
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowDeleteModal(true);
                          }}
                          disabled={
                            role.isSystemRole ||
                            (role.users && role.users.length > 0)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            role.isSystemRole ||
                            (role.users && role.users.length > 0)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            role.isSystemRole
                              ? t("rolesManagement.cannotDeleteSystemRole")
                              : role.users && role.users.length > 0
                                ? t("rolesManagement.cannotDeleteRoleWithUsers")
                                : t("rolesManagement.delete")
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateRoleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadRoles();
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && selectedRole && (
        <EditRoleModal
          isOpen={showEditModal}
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSuccess={() => {
            loadRoles();
            setShowEditModal(false);
            setSelectedRole(null);
          }}
        />
      )}

      {showDetailsModal && selectedRole && (
        <RoleDetailsModal
          isOpen={showDetailsModal}
          role={selectedRole}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRole(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {showDeleteModal && selectedRole && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title={t("rolesManagement.deleteRole")}
          message={t("rolesManagement.deleteRoleMessage")}
          confirmText={t("rolesManagement.delete")}
          cancelText={t("rolesManagement.cancel")}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}
