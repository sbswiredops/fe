/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Key } from "lucide-react";
import {
  getAllRoles,
  getAllPermissions,
  formatPermissionLabel,
  updateRole,
} from "@/services/roleService";
import useToast from "@/components/hoock/toast";

export default function PermissionsManagement() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true); // added
  const [viewRole, setViewRole] = useState<any | null>(null);
  const [editRole, setEditRole] = useState<any | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(""); // Step 1

  useEffect(() => {
    // Fetch roles and permissions
    getAllRoles()
      .then(setRoles)
      .catch(() => {
        showToast("Failed to load roles", "error");
      });

    setLoadingPermissions(true);
    getAllPermissions()
      .then((res) => {
        const uniquePermissions = Array.from(new Set(res ?? []));
        setPermissions(uniquePermissions);
      })
      .catch(() => {
        showToast(t("editRoleModal.loadPermissionsError"), "error");
      })
      .finally(() => {
        setLoadingPermissions(false);
      });
  }, []);

  const handleEdit = (role: any) => {
    setEditRole(role);
    setEditPermissions(Array.from(new Set(role.permissions))); // Unique copy
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setEditPermissions(selectedValues);
  };

  const togglePermission = (permission: string) => {
    setEditPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      } else {
        return [...new Set([...prev, permission])]; // Unique
      }
    });
  };

  const handleSave = async () => {
    if (!editRole) return;
    setLoading(true);
    await updateRole(editRole.id, {
      permissions: Array.from(new Set(editPermissions)),
    }); // Unique
    setLoading(false);
    setEditRole(null);
    getAllRoles().then(setRoles);
  };

  const filteredPermissions = permissions.filter((p) =>
    formatPermissionLabel(p).toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("permissionsManagement.title")}
        </h3>
        <p className="text-gray-600">
          {t("permissionsManagement.description")}
        </p>
      </div>
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-800 font-semibold">
              {t("Role Name")}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-800 font-semibold">
              {t("Permissions")}
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-800 font-semibold">
              {t("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="border border-gray-300 px-4 py-2 text-gray-900">
                {role.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {role.permissions.map((p: string) => (
                  <span
                    key={p}
                    className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1 text-xs font-medium"
                  >
                    {formatPermissionLabel(p)}
                  </span>
                ))}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => handleEdit(role)}
                >
                  {t("Edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editRole && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[350px] text-gray-900">
            <h4 className="font-semibold mb-2 text-gray-900">
              {t("Edit")} {editRole.name}
            </h4>
            <div className="mb-4">
              <label className="block mb-1 text-gray-800">
                {t("Permissions")}
              </label>
              {/* Step 3: Search box */}
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search permissions..."
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded"
              />
              <div className="border rounded p-2 h-64 overflow-y-auto">
                {loadingPermissions ? (
                  <div className="flex justify-center py-8">
                    <span className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></span>
                  </div>
                ) : (
                  filteredPermissions.map((p) => (
                    <div
                      key={p}
                      className="flex items-center gap-2 p-1 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        id={p}
                        checked={editPermissions.includes(p)}
                        onChange={() => togglePermission(p)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={p} className="cursor-pointer">
                        {formatPermissionLabel(p)}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-1 bg-green-500 text-white rounded"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? t("Saving...") : t("Save")}
              </button>
              <button
                className="px-4 py-1 bg-gray-200 rounded text-gray-800"
                onClick={() => setEditRole(null)}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
