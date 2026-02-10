"use client";

import React from "react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import Modal from "@/components/ui/Modal";
import { X, Shield, Users as UsersIcon, Calendar, Key } from "lucide-react";
import {
  Role,
  permissionCategories,
  formatPermissionLabel,
} from "@/services/roleService";

interface RoleDetailsModalProps {
  isOpen: boolean;
  role: Role;
  onClose: () => void;
  onEdit: () => void;
}

export default function RoleDetailsModal({
  isOpen,
  role,
  onClose,
  onEdit,
}: RoleDetailsModalProps) {
  const { t } = useLanguage();

  // Group permissions by category
  const groupedPermissions: Record<string, string[]> = {};
  Object.entries(permissionCategories).forEach(([category, permissions]) => {
    const rolePerms = permissions.filter((p) => role.permissions.includes(p));
    if (rolePerms.length > 0) {
      groupedPermissions[category] = rolePerms;
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{role.name}</h2>
          <div className="flex items-center space-x-2 mt-2">
            {role.isSystemRole && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Shield className="w-3 h-3 mr-1" />
                {t("roleDetailsModal.systemRole")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Role Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">
              {t("roleDetailsModal.description")}
            </label>
            <p className="text-gray-900 mt-1">{role.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {t("roleDetailsModal.created")}
              </label>
              <p className="text-gray-900 text-sm mt-1">
                {new Date(role.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {t("roleDetailsModal.updated")}
              </label>
              <p className="text-gray-900 text-sm mt-1">
                {new Date(role.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              {t("roleDetailsModal.permissions")}
            </h3>
            <span className="text-sm text-gray-600">
              {role.permissions.length} {t("roleDetailsModal.permissionsCount")}
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedPermissions).map(
              ([category, permissions]) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-900">
                            {formatPermissionLabel(permission)}
                          </span>
                          <span className="text-gray-400 text-xs block">
                            {permission}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Assigned Users Section */}
        {role.users && role.users.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
              {t("roleDetailsModal.assignedUsers")}
            </h3>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {role.users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("roleDetailsModal.close")}
          </button>
          {!role.isSystemRole && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("roleDetailsModal.editRole")}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
