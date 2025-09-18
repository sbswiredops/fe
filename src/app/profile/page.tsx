"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import useToast from "@/components/hoock/toast";
import { useAuth } from "@/components/contexts/AuthContext";
import { userService } from "@/services/userService";
import type { UpdateUserRequest, User } from "@/types/api";

// Role helpers (kept consistent with layout/protected route)
const ADMIN_ROLES = ['admin', 'super_admin', 'sales_marketing', 'finance_accountant', 'content_creator'];
const TEACHER_ROLES = ['teacher', 'instructor'];
const normalizeRole = (role: any) =>
  String(typeof role === 'string' ? role : role?.name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
const getRoleGroup = (role: any): 'admin' | 'teacher' | 'student' | 'other' => {
  const r = normalizeRole(role);
  if (!r) return 'other';
  if (ADMIN_ROLES.includes(r)) return 'admin';
  if (TEACHER_ROLES.includes(r)) return 'teacher';
  if (r === 'student') return 'student';
  return 'other';
};

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileSettings />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ProfileSettings() {
  const { user, getCurrentUser } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const roleGroup = useMemo(() => getRoleGroup(user?.role), [user]);

  const initial = useMemo(() => {
    const u = user as User | null;
    return {
      firstName: u?.firstName || "",
      lastName: u?.lastName || "",
      email: u?.email || "",
      phone: u?.phone || "",
      specialization: u?.specialization || "",
      experience: u?.experience || "",
      profile: {
        bio: u?.profile?.bio || "",
        dateOfBirth: u?.profile?.dateOfBirth || "",
        address: {
          street: u?.profile?.address?.street || "",
          city: u?.profile?.address?.city || "",
          state: u?.profile?.address?.state || "",
          country: u?.profile?.address?.country || "",
          zipCode: u?.profile?.address?.zipCode || "",
        },
        socialLinks: {
          linkedin: u?.profile?.socialLinks?.linkedin || "",
          twitter: u?.profile?.socialLinks?.twitter || "",
          github: u?.profile?.socialLinks?.github || "",
          website: u?.profile?.socialLinks?.website || "",
        },
      },
    } as UpdateUserRequest;
  }, [user]);

  const [form, setForm] = useState<UpdateUserRequest>(initial);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          await getCurrentUser();
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [user, getCurrentUser]);

  const updateField = (path: string, value: string) => {
    setForm(prev => {
      const next: any = { ...prev };
      const keys = path.split(".");
      let cur: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cur[k] = cur[k] ?? {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return next as UpdateUserRequest;
    });
  };

  const pruneEmpty = (obj: any) => {
    if (obj === null || obj === undefined) return undefined;
    if (typeof obj !== 'object') return obj === '' ? undefined : obj;
    const out: any = Array.isArray(obj) ? [] : {};
    Object.entries(obj).forEach(([k, v]) => {
      const p = pruneEmpty(v);
      if (p !== undefined) out[k] = p;
    });
    return Object.keys(out).length ? out : undefined;
  };

  const buildPayload = (): UpdateUserRequest => {
    const base: UpdateUserRequest = {
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      email: form.email?.trim(),
      phone: form.phone?.trim(),
    };

    if (roleGroup === 'teacher') {
      base.specialization = form.specialization?.trim();
      base.experience = form.experience?.trim();
      base.profile = {
        bio: form.profile?.bio?.trim(),
        socialLinks: {
          linkedin: form.profile?.socialLinks?.linkedin?.trim(),
          twitter: form.profile?.socialLinks?.twitter?.trim(),
          github: form.profile?.socialLinks?.github?.trim(),
          website: form.profile?.socialLinks?.website?.trim(),
        },
      };
    }

    if (roleGroup === 'student') {
      base.profile = {
        bio: form.profile?.bio?.trim(),
        dateOfBirth: form.profile?.dateOfBirth?.trim(),
        address: {
          street: form.profile?.address?.street?.trim(),
          city: form.profile?.address?.city?.trim(),
          state: form.profile?.address?.state?.trim(),
          country: form.profile?.address?.country?.trim(),
          zipCode: form.profile?.address?.zipCode?.trim(),
        },
      };
    }

    if (roleGroup === 'admin') {
      // Admin keeps basic info only; optional bio
      if (form.profile?.bio) {
        base.profile = { bio: form.profile?.bio?.trim() };
      }
    }

    return pruneEmpty(base) as UpdateUserRequest;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setSaving(true);
      const payload = buildPayload();
      const res = await userService.update(user.id, payload);
      const updated = (res as any)?.data || null;
      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
        await getCurrentUser();
      }
      showToast((res as any)?.message || "Profile updated successfully", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const showTeacherFields = roleGroup === 'teacher';
  const showStudentFields = roleGroup === 'student';
  const showAdminFields = roleGroup === 'admin';

  return (
    <div className="p-6">
      <ToastContainer position="top-right" newestOnTop />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Your role: <span className="font-medium capitalize">{roleGroup}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName || ""} onChange={e => updateField("firstName", e.target.value)} />
            <Input label="Last Name" value={form.lastName || ""} onChange={e => updateField("lastName", e.target.value)} />
            <Input type="email" label="Email" value={form.email || ""} onChange={e => updateField("email", e.target.value)} />
            <Input label="Phone" value={form.phone || ""} onChange={e => updateField("phone", e.target.value)} />
            {showTeacherFields && (
              <>
                <Input label="Specialization" value={form.specialization || ""} onChange={e => updateField("specialization", e.target.value)} />
                <Input label="Experience" value={form.experience || ""} onChange={e => updateField("experience", e.target.value)} />
              </>
            )}
          </div>
        </section>

        {(showTeacherFields || showStudentFields || (showAdminFields && (form.profile?.bio || true))) && (
          <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal border-gray-300 focus:border-blue-500"
                  rows={4}
                  value={form.profile?.bio || ""}
                  onChange={e => updateField("profile.bio", e.target.value)}
                />
              </div>
              {showStudentFields && (
                <Input label="Date of Birth" value={form.profile?.dateOfBirth || ""} onChange={e => updateField("profile.dateOfBirth", e.target.value)} placeholder="YYYY-MM-DD" />
              )}
            </div>

            {showStudentFields && (
              <>
                <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Street" value={form.profile?.address?.street || ""} onChange={e => updateField("profile.address.street", e.target.value)} />
                  <Input label="City" value={form.profile?.address?.city || ""} onChange={e => updateField("profile.address.city", e.target.value)} />
                  <Input label="State" value={form.profile?.address?.state || ""} onChange={e => updateField("profile.address.state", e.target.value)} />
                  <Input label="Country" value={form.profile?.address?.country || ""} onChange={e => updateField("profile.address.country", e.target.value)} />
                  <Input label="ZIP Code" value={form.profile?.address?.zipCode || ""} onChange={e => updateField("profile.address.zipCode", e.target.value)} />
                </div>
              </>
            )}

            {showTeacherFields && (
              <>
                <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="LinkedIn" value={form.profile?.socialLinks?.linkedin || ""} onChange={e => updateField("profile.socialLinks.linkedin", e.target.value)} />
                  <Input label="Twitter" value={form.profile?.socialLinks?.twitter || ""} onChange={e => updateField("profile.socialLinks.twitter", e.target.value)} />
                  <Input label="GitHub" value={form.profile?.socialLinks?.github || ""} onChange={e => updateField("profile.socialLinks.github", e.target.value)} />
                  <Input label="Website" value={form.profile?.socialLinks?.website || ""} onChange={e => updateField("profile.socialLinks.website", e.target.value)} />
                </div>
              </>
            )}
          </section>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setForm(initial)} disabled={saving || loading}>Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} disabled={loading}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
