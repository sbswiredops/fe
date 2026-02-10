/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import Modal from "@/components/ui/Modal";
import { X, Loader2 } from "lucide-react";
import {
  createRole,
  getAllPermissions,
  permissionCategories,
  formatPermissionLabel,
  validateRoleName,
  validateRoleDescription,
  validatePermissions,
  CreateRoleRequest,
} from "@/services/roleService";
import useToast from "@/components/hoock/toast";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    permissions: [],
  });

  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await getAllPermissions();
      setAvailablePermissions(response || []);
    } catch (error: any) {
      showToast(t("createRoleModal.loadPermissionsError"), "error");
    } finally {
      setLoadingPermissions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateRoleName(formData.name);
    if (nameValidation !== true) {
      newErrors.name = nameValidation;
    }

    const descValidation = validateRoleDescription(formData.description);
    if (descValidation !== true) {
      newErrors.description = descValidation;
    }

    const permValidation = validatePermissions(formData.permissions);
    if (permValidation !== true) {
      newErrors.permissions = permValidation;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await createRole(formData);

      showToast(t("createRoleModal.createSuccess"), "success");

      onSuccess();
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          error.message ||
          t("createRoleModal.createError"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: "" }));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const selectAllInCategory = (category: string, permissions: string[]) => {
    const allSelected = permissions.every((p) =>
      formData.permissions.includes(p),
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !permissions.includes(p))
        : [...new Set([...prev.permissions, ...permissions])],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("createRoleModal.title")}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("createRoleModal.nameLabel")} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder={t("createRoleModal.namePlaceholder")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {t("createRoleModal.nameHint")}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("createRoleModal.descriptionLabel")} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: "" });
            }}
            placeholder={t("createRoleModal.descriptionPlaceholder")}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("createRoleModal.selectPermissionsLabel")} *
          </label>

          {errors.permissions && (
            <p className="text-red-500 text-sm mb-2">{errors.permissions}</p>
          )}

          {loadingPermissions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto p-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {formatPermissionLabel(permission)}
                  </span>
                  <span className="text-xs text-gray-400">({permission})</span>
                </label>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-2">
            {t("createRoleModal.selected")} {formData.permissions.length}{" "}
            {t("createRoleModal.permissions")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {t("createRoleModal.cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{t("createRoleModal.create")}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
