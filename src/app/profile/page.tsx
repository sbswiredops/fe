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
import type { UserAddress } from "@/services/userService";

type CollegeInfo = {
  id?: string;
  _id?: string;
  collegeName: string;
  department: string;
  session: string;
  rollNumber: string;
  registrationNumber: string;
  passingYear: string | number;
};

const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "sales_marketing",
  "finance_accountant",
  "content_creator",
];
const TEACHER_ROLES = ["teacher", "instructor"];
const normalizeRole = (role: any) =>
  String(typeof role === "string" ? role : (role?.name ?? ""))
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
const getRoleGroup = (role: any): "admin" | "teacher" | "student" | "other" => {
  const r = normalizeRole(role);
  if (!r) return "other";
  if (ADMIN_ROLES.includes(r)) return "admin";
  if (TEACHER_ROLES.includes(r)) return "teacher";
  if (r === "student") return "student";
  return "other";
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
    // Map addresses from API to UI format
    let addresses: UserAddress[] = [];
    if (Array.isArray((u as any)?.addresses)) {
      addresses = (u as any).addresses.map((a: any) => ({
        id: a.id || a._id,
        city: a.city || "",
        state: a.state || "",
        country: a.country || "",
        zipCode: a.zipcode || a.postalCode || a.zipCode || "",
      }));
    } else if (u?.profile?.address) {
      addresses = [
        {
          id: (u.profile.address as any)?.id || (u.profile.address as any)?._id,
          city: u.profile.address.city || "",
          state: u.profile.address.state || "",
          country: u.profile.address.country || "",
          zipCode: u.profile.address.zipCode || "",
        },
      ];
    }

    const clgInfos: CollegeInfo[] = [];
    if (Array.isArray((u as any)?.collegeInfos)) {
      clgInfos.push(
        ...(u as any).collegeInfos.map((c: any) => ({
          id: c.id || c._id,
          collegeName: c.collegeName || "",
          department: c.department || "",
          session: c.session || "",
          rollNumber: c.rollNumber || "",
          registrationNumber: c.registrationNumber || "",
          passingYear: c.passingYear || "",
        })),
      );
    } else if (u?.clgInfo) {
      clgInfos.push({
        id: (u.clgInfo as any)?.id || (u.clgInfo as any)?._id,
        collegeName: u.clgInfo.collegeName || "",
        department: u.clgInfo.department || "",
        session: u.clgInfo.session || "",
        rollNumber: u.clgInfo.rollNumber || "",
        registrationNumber: u.clgInfo.registrationNumber || "",
        passingYear: u.clgInfo.passingYear || "",
      });
    }

    return {
      firstName: u?.firstName || "",
      lastName: u?.lastName || "",
      email: u?.email || "",
      phone: u?.phone || "",
      avatar: (u as any)?.avatar || (u as any)?.profileImage || "",
      specialization: u?.specialization || "",
      experience: u?.experience || "",
      profile: {
        bio: u?.profile?.bio || "",
        dateOfBirth: u?.profile?.dateOfBirth || "",
        addresses,
        socialLinks: {
          linkedin: u?.profile?.socialLinks?.linkedin || "",
          twitter: u?.profile?.socialLinks?.twitter || "",
          github: u?.profile?.socialLinks?.github || "",
          website: u?.profile?.socialLinks?.website || "",
        },
      },
      clgInfos,
    } as UpdateUserRequest & { clgInfos?: CollegeInfo[] };
  }, [user]);

  const [form, setForm] = useState<any>(initial);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarPreview, setAvatarPreview] = useState<string>(
    typeof initial.avatar === "string" ? initial.avatar : "",
  );

  useEffect(() => {
    setForm(initial);
    if (typeof initial.avatar === "string") setAvatarPreview(initial.avatar);
  }, [initial]);

  useEffect(() => {
    if (!form?.avatar) return;
    if (typeof form.avatar === "string") {
      setAvatarPreview(form.avatar);
      return;
    }
    if (form.avatar instanceof File) {
      const url = URL.createObjectURL(form.avatar);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form?.avatar]);

  // Data already available from /auth/me via context; no need to refetch by ID

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
    setForm((prev: any) => {
      const next: any = { ...prev };
      const keys = path.split(".");
      let cur: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cur[k] = cur[k] ?? {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const pruneEmpty = (obj: any) => {
    if (obj === null || obj === undefined) return undefined;
    if (obj instanceof File) return obj;
    if (typeof obj !== "object") return obj === "" ? undefined : obj;
    const out: any = Array.isArray(obj) ? [] : {};
    Object.entries(obj).forEach(([k, v]) => {
      const p = pruneEmpty(v);
      if (p !== undefined) out[k] = p;
    });
    return Object.keys(out).length ? out : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== "profile") return;
    if (!user?.id) return;
    try {
      setSaving(true);
      // Update basic profile
      const payload: UpdateUserRequest = {
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim(),
        bio: form.profile?.bio?.trim(),
        avatar: form.avatar,
      };
      if (roleGroup === "teacher") {
        payload.specialization = form.specialization?.trim();
        payload.experience = form.experience?.trim();
        payload.profile = {
          socialLinks: {
            linkedin: form.profile?.socialLinks?.linkedin?.trim(),
            twitter: form.profile?.socialLinks?.twitter?.trim(),
            github: form.profile?.socialLinks?.github?.trim(),
            website: form.profile?.socialLinks?.website?.trim(),
          },
        };
      }
      // student DOB field removed from form; do not include dateOfBirth in payload
      if (roleGroup === "admin") {
        // admin: no profile payload for bio; bio is top-level
      }
      await userService.update(user.id, pruneEmpty(payload));

      // Student: update all addresses and college infos
      if (roleGroup === "student") {
        const pruneUndefined = (obj: Record<string, unknown>) =>
          Object.fromEntries(
            Object.entries(obj).filter(
              ([, v]) => v !== undefined && v !== null,
            ),
          );
        // Addresses
        const addresses = Array.isArray(form.profile?.addresses)
          ? form.profile.addresses
          : [];
        for (const addr of addresses) {
          const hasId = (addr as any)?.id || (addr as any)?._id;
          if (hasId) continue; // existing address handled via per-item update
          const addressPayload = pruneUndefined({
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postalCode: addr.zipCode,
          });
          if (Object.values(addressPayload).some((v) => v)) {
            await userService.createAddress(user.id, addressPayload);
          }
        }
        // College Infos
        const clgInfos = Array.isArray(form.clgInfos) ? form.clgInfos : [];
        for (const clg of clgInfos) {
          const hasId = (clg as any)?.id || (clg as any)?._id;
          if (hasId) continue; // existing record updated individually
          const clgPayload = pruneEmpty({
            collegeName: clg.collegeName,
            department: clg.department,
            session: clg.session,
            rollNumber: clg.rollNumber,
            registrationNumber: clg.registrationNumber,
            passingYear:
              clg.passingYear !== "" &&
              clg.passingYear !== undefined &&
              clg.passingYear !== null
                ? Number(clg.passingYear)
                : undefined,
          });
          if (Object.values(clgPayload).some((v) => v)) {
            await userService.createClgInfo(user.id, clgPayload);
          }
        }
      }

      await getCurrentUser();
      showToast("Profile updated successfully", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const showTeacherFields = roleGroup === "teacher";
  const showStudentFields = roleGroup === "student";
  const showAdminFields = roleGroup === "admin";

  // Tab content renderers
  const renderProfileTab = () => (
    <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-500">No avatar</span>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Avatar
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
            className="block text-sm text-gray-700"
          />
          {avatarPreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAvatarRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Basic Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={form.firstName || ""}
          onChange={(e) => updateField("firstName", e.target.value)}
        />
        <Input
          label="Last Name"
          value={form.lastName || ""}
          onChange={(e) => updateField("lastName", e.target.value)}
        />
        <Input
          type="email"
          label="Email"
          value={form.email || ""}
          onChange={(e) => updateField("email", e.target.value)}
        />
        <Input
          label="Phone"
          value={form.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />
        {showTeacherFields && (
          <>
            <Input
              label="Specialization"
              value={form.specialization || ""}
              onChange={(e) => updateField("specialization", e.target.value)}
            />
            <Input
              label="Experience"
              value={form.experience || ""}
              onChange={(e) => updateField("experience", e.target.value)}
            />
          </>
        )}
      </div>
      {(showTeacherFields ||
        showStudentFields ||
        (showAdminFields && (form.profile?.bio || true))) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal border-gray-300 focus:border-blue-500"
                rows={4}
                value={form.profile?.bio || ""}
                onChange={(e) => updateField("profile.bio", e.target.value)}
              />
            </div>
            {/* Date of Birth field removed */}
          </div>
          {showTeacherFields && (
            <>
              <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn"
                  value={form.profile?.socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    updateField("profile.socialLinks.linkedin", e.target.value)
                  }
                />
                <Input
                  label="Twitter"
                  value={form.profile?.socialLinks?.twitter || ""}
                  onChange={(e) =>
                    updateField("profile.socialLinks.twitter", e.target.value)
                  }
                />
                <Input
                  label="GitHub"
                  value={form.profile?.socialLinks?.github || ""}
                  onChange={(e) =>
                    updateField("profile.socialLinks.github", e.target.value)
                  }
                />
                <Input
                  label="Website"
                  value={form.profile?.socialLinks?.website || ""}
                  onChange={(e) =>
                    updateField("profile.socialLinks.website", e.target.value)
                  }
                />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );

  // Helper for multiple addresses
  const addresses: UserAddress[] = useMemo((): UserAddress[] => {
    if (!showStudentFields) return [];
    const addr = form.profile?.addresses || form.profile?.address;
    if (Array.isArray(addr)) return addr as UserAddress[];
    if (addr && typeof addr === "object") return [addr] as UserAddress[];
    return [];
  }, [form, showStudentFields]);

  const handleAddAddress = () => {
    setForm((prev: any) => {
      const prevAddresses = Array.isArray(prev.profile?.addresses)
        ? prev.profile.addresses
        : prev.profile?.address
          ? [prev.profile.address]
          : [];
      return {
        ...prev,
        profile: {
          ...prev.profile,
          addresses: [
            ...prevAddresses,
            { city: "", state: "", country: "", zipCode: "" },
          ],
        },
      };
    });
  };

  const handleAvatarChange = (file?: File | null) => {
    setForm((prev: any) => ({
      ...prev,
      avatar: file || "",
    }));
  };

  const handleAvatarRemove = () => {
    handleAvatarChange(null);
    setAvatarPreview("");
  };

  const handleCreateAddress = async (idx: number) => {
    if (!user?.id) return;
    const addr = addresses[idx];
    const addressPayload = {
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.zipCode,
    };
    try {
      await userService.createAddress(user.id, addressPayload);
      showToast(`Address ${idx + 1} created successfully`, "success");
      await getCurrentUser();
    } catch (err: any) {
      showToast(err?.message || `Failed to create address ${idx + 1}`, "error");
    }
  };

  const handleAddressChange = (idx: number, field: string, value: string) => {
    setForm((prev: any) => {
      const prevAddresses = Array.isArray(prev.profile?.addresses)
        ? prev.profile.addresses
        : prev.profile?.address
          ? [prev.profile.address]
          : [];
      const updated = prevAddresses.map((a: any, i: number) =>
        i === idx ? { ...a, [field]: value } : a,
      );
      return {
        ...prev,
        profile: {
          ...prev.profile,
          addresses: updated,
        },
      };
    });
  };

  // Update a single address entry
  const handleUpdateAddress = async (idx: number) => {
    if (!user?.id) return;
    const addr = addresses[idx];
    const addressPayload = {
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.zipCode,
    };
    const addressId = (addr as any)?.id || (addr as any)?._id;
    try {
      if (addressId) {
        await userService.updateAddress(user.id, addressId, addressPayload);
        showToast(`Address ${idx + 1} updated successfully`, "success");
      } else {
        await handleCreateAddress(idx);
      }
    } catch (err: any) {
      showToast(err?.message || `Failed to update address ${idx + 1}`, "error");
    }
  };

  // Delete a single address entry
  const handleDeleteAddress = async (idx: number) => {
    if (!user?.id) return;
    const addr = addresses[idx];
    const addressId = (addr as any)?.id || (addr as any)?._id;
    if (addressId) {
      try {
        await userService.deleteAddress(user.id, addressId);
        setForm((prev: any) => {
          const prevAddresses = Array.isArray(prev.profile?.addresses)
            ? prev.profile.addresses
            : prev.profile?.address
              ? [prev.profile.address]
              : [];
          const updated = prevAddresses.filter(
            (_: any, i: number) => i !== idx,
          );
          return {
            ...prev,
            profile: {
              ...prev.profile,
              addresses: updated,
            },
          };
        });
        showToast(`Address ${idx + 1} deleted successfully`, "success");
      } catch (err: any) {
        showToast(
          err?.message || `Failed to delete address ${idx + 1}`,
          "error",
        );
      }
    } else {
      // If no id, just remove from UI
      setForm((prev: any) => {
        const prevAddresses = Array.isArray(prev.profile?.addresses)
          ? prev.profile.addresses
          : prev.profile?.address
            ? [prev.profile.address]
            : [];
        const updated = prevAddresses.filter((_: any, i: number) => i !== idx);
        return {
          ...prev,
          profile: {
            ...prev.profile,
            addresses: updated,
          },
        };
      });
      showToast(`Address ${idx + 1} removed`, "success");
    }
  };

  const renderAddressTab = () =>
    showStudentFields && (
      <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
        {addresses.map((address, idx) => (
          <div key={idx} className="mb-8">
            <div className="mb-2 font-semibold text-gray-800 flex items-center justify-between">
              <span>Address {idx + 1}</span>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDeleteAddress(idx)}
              >
                Delete
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                value={address.city || ""}
                onChange={(e) =>
                  handleAddressChange(idx, "city", e.target.value)
                }
              />
              <Input
                label="State"
                value={address.state || ""}
                onChange={(e) =>
                  handleAddressChange(idx, "state", e.target.value)
                }
              />
              <Input
                label="Country"
                value={address.country || ""}
                onChange={(e) =>
                  handleAddressChange(idx, "country", e.target.value)
                }
              />
              <Input
                label="ZIP Code"
                value={address.zipCode || ""}
                onChange={(e) =>
                  handleAddressChange(idx, "zipCode", e.target.value)
                }
              />
            </div>
            <div className="mt-2 flex justify-end">
              {(address as any)?.id || (address as any)?._id ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleUpdateAddress(idx)}
                >
                  Update Address
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleCreateAddress(idx)}
                >
                  Submit Address
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={handleAddAddress}>
          Add Address
        </Button>
      </section>
    );

  // Helper for multiple college infos
  const clgInfos: CollegeInfo[] = useMemo(() => {
    if (!showStudentFields) return [];
    const ci = form.clgInfos || form.clgInfo;
    if (Array.isArray(ci)) return ci;
    if (ci && typeof ci === "object") return [ci];
    return [];
  }, [form, showStudentFields]);

  const handleAddClgInfo = () => {
    setForm((prev: any) => {
      const prevClgInfos = Array.isArray(prev.clgInfos)
        ? prev.clgInfos
        : prev.clgInfo
          ? [prev.clgInfo]
          : [];
      return {
        ...prev,
        clgInfos: [
          ...prevClgInfos,
          {
            collegeName: "",
            department: "",
            session: "",
            rollNumber: "",
            registrationNumber: "",
            passingYear: "",
          },
        ],
      };
    });
  };

  const handleCreateClgInfo = async (idx: number) => {
    if (!user?.id) return;
    const clg = clgInfos[idx];
    const clgPayload = {
      collegeName: clg.collegeName,
      department: clg.department,
      session: clg.session,
      rollNumber: clg.rollNumber,
      registrationNumber: clg.registrationNumber,
      passingYear:
        clg.passingYear !== "" &&
        clg.passingYear !== undefined &&
        clg.passingYear !== null
          ? Number(clg.passingYear)
          : undefined,
    };
    try {
      await userService.createClgInfo(user.id, clgPayload);
      showToast(`College Info ${idx + 1} created successfully`, "success");
      await getCurrentUser();
    } catch (err: any) {
      showToast(
        err?.message || `Failed to create college info ${idx + 1}`,
        "error",
      );
    }
  };

  // Delete a single college info entry
  const handleDeleteClgInfo = async (idx: number) => {
    if (!user?.id) return;
    const clg = clgInfos[idx];
    const clgId = (clg as any)?.id || (clg as any)?._id;
    if (clgId) {
      try {
        await userService.deleteClgInfo(user.id, clgId);
        setForm((prev: any) => {
          const prevClgInfos = Array.isArray(prev.clgInfos)
            ? prev.clgInfos
            : prev.clgInfo
              ? [prev.clgInfo]
              : [];
          const updated = prevClgInfos.filter((_: any, i: number) => i !== idx);
          return {
            ...prev,
            clgInfos: updated,
          };
        });
        showToast(`College Info ${idx + 1} deleted successfully`, "success");
      } catch (err: any) {
        showToast(
          err?.message || `Failed to delete college info ${idx + 1}`,
          "error",
        );
      }
    } else {
      // If no id, just remove from UI
      setForm((prev: any) => {
        const prevClgInfos = Array.isArray(prev.clgInfos)
          ? prev.clgInfos
          : prev.clgInfo
            ? [prev.clgInfo]
            : [];
        const updated = prevClgInfos.filter((_: any, i: number) => i !== idx);
        return {
          ...prev,
          clgInfos: updated,
        };
      });
      showToast(`College Info ${idx + 1} removed`, "success");
    }
  };
  // Update a single college info entry
  const handleUpdateClgInfo = async (idx: number) => {
    if (!user?.id) return;
    const clg = clgInfos[idx];
    const clgPayload = {
      collegeName: clg.collegeName,
      department: clg.department,
      session: clg.session,
      rollNumber: clg.rollNumber,
      registrationNumber: clg.registrationNumber,
      passingYear:
        clg.passingYear !== "" &&
        clg.passingYear !== undefined &&
        clg.passingYear !== null
          ? Number(clg.passingYear)
          : undefined,
    };
    const clgId = (clg as any)?.id || (clg as any)?._id;
    try {
      if (clgId) {
        await userService.updateClgInfo(user.id, clgId, clgPayload);
        showToast(`College Info ${idx + 1} updated successfully`, "success");
      } else {
        await handleCreateClgInfo(idx);
      }
    } catch (err: any) {
      showToast(
        err?.message || `Failed to update college info ${idx + 1}`,
        "error",
      );
    }
  };

  const handleClgInfoChange = (idx: number, field: string, value: string) => {
    setForm((prev: any) => {
      const prevClgInfos = Array.isArray(prev.clgInfos)
        ? prev.clgInfos
        : prev.clgInfo
          ? [prev.clgInfo]
          : [];
      const updated = prevClgInfos.map((c: any, i: number) =>
        i === idx ? { ...c, [field]: value } : c,
      );
      return {
        ...prev,
        clgInfos: updated,
      };
    });
  };

  const renderCollegeTab = () =>
    showStudentFields && (
      <section className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          College Info
        </h2>
        {clgInfos.map((clg, idx) => (
          <div key={idx} className="mb-6">
            <div className="mb-2 font-semibold text-gray-800 flex items-center justify-between">
              <span>College Info {idx + 1}</span>
              <div className="flex gap-2">
                {(clg as any)?.id || (clg as any)?._id ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateClgInfo(idx)}
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleCreateClgInfo(idx)}
                  >
                    Submit
                  </Button>
                )}
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClgInfo(idx)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="College Name"
                value={clg.collegeName || ""}
                onChange={(e) =>
                  handleClgInfoChange(idx, "collegeName", e.target.value)
                }
              />
              <Input
                label="Department"
                value={clg.department || ""}
                onChange={(e) =>
                  handleClgInfoChange(idx, "department", e.target.value)
                }
              />
              <Input
                label="Session"
                value={clg.session || ""}
                onChange={(e) =>
                  handleClgInfoChange(idx, "session", e.target.value)
                }
              />
              <Input
                label="Roll Number"
                value={clg.rollNumber || ""}
                onChange={(e) =>
                  handleClgInfoChange(idx, "rollNumber", e.target.value)
                }
              />
              <Input
                label="Registration Number"
                value={clg.registrationNumber || ""}
                onChange={(e) =>
                  handleClgInfoChange(idx, "registrationNumber", e.target.value)
                }
              />
              <Input
                label="Passing Year"
                value={clg.passingYear || ""}
                onChange={(e) =>
                  handleClgInfoChange(idx, "passingYear", e.target.value)
                }
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={handleAddClgInfo}>
          Add College Info
        </Button>
      </section>
    );

  return (
    <div className="p-6">
      <ToastContainer position="top-right" newestOnTop />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Your role: <span className="font-medium capitalize">{roleGroup}</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === "profile" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            {showStudentFields && (
              <>
                <button
                  type="button"
                  className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === "address" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
                  onClick={() => setActiveTab("address")}
                >
                  Address
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === "college" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
                  onClick={() => setActiveTab("college")}
                >
                  College Info
                </button>
              </>
            )}
          </div>
        </div>
        <div>
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "address" && renderAddressTab()}
          {activeTab === "college" && renderCollegeTab()}
        </div>
        {activeTab === "profile" && (
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm(initial)}
              disabled={saving || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
