"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import useToast from "@/components/hoock/toast";
import { validateImageFile } from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import { useAuth } from "@/components/contexts/AuthContext";
import { userService } from "@/services/userService";
import type { UpdateUserRequest, User } from "@/types/api";
import type { UserAddress } from "@/services/userService";
import {
  User as UserIcon,
  MapPin,
  BookOpen,
  Upload,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";

type CollegeInfo = {
  id?: string;
  _id?: string;
  collegeName: string;
  department: string;
  session: string;
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
          passingYear: c.passingYear || "",
        })),
      );
    } else if (u?.clgInfo) {
      clgInfos.push({
        id: (u.clgInfo as any)?.id || (u.clgInfo as any)?._id,
        collegeName: u.clgInfo.collegeName || "",
        department: u.clgInfo.department || "",
        session: u.clgInfo.session || "",
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
        bio: u?.profile?.bio || u?.bio || "",
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>("");

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
      // Prevent submitting oversized avatar files
      if (form?.avatar instanceof File) {
        const maxSize = API_CONFIG?.UPLOAD?.MAX_FILE_SIZE || 10 * 1024 * 1024;
        if (form.avatar.size > maxSize) {
          showToast(
            `Avatar too large. Maximum allowed is ${Math.round(maxSize / (1024 * 1024))}MB`,
            "error",
          );
          return;
        }
      }

      setSaving(true);
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
      await userService.update(user.id, pruneEmpty(payload));

      if (roleGroup === "student") {
        const pruneUndefined = (obj: Record<string, unknown>) =>
          Object.fromEntries(
            Object.entries(obj).filter(
              ([, v]) => v !== undefined && v !== null,
            ),
          );
        const addresses = Array.isArray(form.profile?.addresses)
          ? form.profile.addresses
          : [];
        for (const addr of addresses) {
          const hasId = (addr as any)?.id || (addr as any)?._id;
          if (hasId) continue;
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
        const clgInfos = Array.isArray(form.clgInfos) ? form.clgInfos : [];
        for (const clg of clgInfos) {
          const hasId = (clg as any)?.id || (clg as any)?._id;
          if (hasId) continue;
          const clgPayload = pruneEmpty({
            collegeName: clg.collegeName,
            department: clg.department,
            session: clg.session,
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
  const MAX_ALLOWED = 2;

  const renderProfileTab = () => (
    <section className="space-y-6 w-full overflow-hidden">
      {/* Avatar Section - FIXED OVERFLOW */}
      <div className="w-full bg-gradient-to-r from-[#51356e]/5 via-transparent to-[#8e67b6]/5 rounded-xl border border-[#51356e]/20 p-4 sm:p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 w-full">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={40} className="text-gray-400" />
              )}
            </div>
            {avatarPreview && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white shadow-md flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profile Picture
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 break-words">
              Upload a professional photo. Recommended: 200×200px, JPG/PNG, max
              2MB
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  handleAvatarChange(f);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                <span className="hidden sm:inline">Upload Photo</span>
                <span className="sm:hidden">Upload</span>
              </Button>
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
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Basic Information
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Update your personal details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full overflow-hidden">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={form.firstName || ""}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={form.lastName || ""}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={form.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={form.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
          />
          {showTeacherFields && (
            <>
              <Input
                label="Specialization"
                placeholder="e.g., Web Development, Data Science"
                value={form.specialization || ""}
                onChange={(e) => updateField("specialization", e.target.value)}
              />
              <Input
                label="Experience"
                placeholder="e.g., 5 years in software development"
                value={form.experience || ""}
                onChange={(e) => updateField("experience", e.target.value)}
              />
            </>
          )}
        </div>
      </div>

      {/* Profile Details Section */}
      {(showTeacherFields ||
        showStudentFields ||
        (showAdminFields && (form.profile?.bio || true))) && (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Profile Details
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Add more information about yourself
            </p>
          </div>

          <div className="space-y-4 w-full overflow-hidden">
            <div className="space-y-2 w-full overflow-hidden">
              <label className="block text-sm font-semibold text-gray-700">
                Bio
              </label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e]/20 focus:border-[#51356e] transition-colors text-gray-900 placeholder:text-gray-400 resize-vertical"
                rows={5}
                placeholder="Write a brief bio about yourself..."
                value={form.profile?.bio || ""}
                onChange={(e) => updateField("profile.bio", e.target.value)}
              />
            </div>
          </div>

          {showTeacherFields && (
            <>
              <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 w-full overflow-hidden">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full overflow-hidden">
                  <Input
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={form.profile?.socialLinks?.linkedin || ""}
                    onChange={(e) =>
                      updateField(
                        "profile.socialLinks.linkedin",
                        e.target.value,
                      )
                    }
                  />
                  <Input
                    label="Twitter"
                    placeholder="https://twitter.com/yourhandle"
                    value={form.profile?.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      updateField("profile.socialLinks.twitter", e.target.value)
                    }
                  />
                  <Input
                    label="GitHub"
                    placeholder="https://github.com/yourprofile"
                    value={form.profile?.socialLinks?.github || ""}
                    onChange={(e) =>
                      updateField("profile.socialLinks.github", e.target.value)
                    }
                  />
                  <Input
                    label="Website"
                    placeholder="https://yourwebsite.com"
                    value={form.profile?.socialLinks?.website || ""}
                    onChange={(e) =>
                      updateField("profile.socialLinks.website", e.target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );

  const addresses: UserAddress[] = useMemo((): UserAddress[] => {
    if (!showStudentFields) return [];
    const addr = form.profile?.addresses || form.profile?.address;
    if (Array.isArray(addr)) return addr as UserAddress[];
    if (addr && typeof addr === "object") return [addr] as UserAddress[];
    return [];
  }, [form, showStudentFields]);

  const handleAddAddress = () => {
    const currentCount = Array.isArray(form.profile?.addresses)
      ? form.profile.addresses.length
      : form.profile?.address
        ? 1
        : 0;
    if (currentCount >= MAX_ALLOWED) {
      showToast(`Maximum ${MAX_ALLOWED} addresses allowed`, "error");
      return;
    }
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
    if (!file) {
      setForm((prev: any) => ({ ...prev, avatar: "" }));
      setAvatarFileName("");
      return;
    }

    // Validate file type and size before setting
    const ok = validateImageFile(file);
    if (!ok) {
      const maxSize = API_CONFIG?.UPLOAD?.MAX_FILE_SIZE || 5 * 1024 * 1024;
      const maxMB = Math.round(maxSize / (1024 * 1024));
      showToast(
        `Invalid image. Use JPG/PNG/WebP and file size under ${maxMB}MB`,
        "error",
      );
      return;
    }

    // show immediate preview; keep File in form so it's uploaded with Save (userService.update handles FormData)
    setForm((prev: any) => ({ ...prev, avatar: file }));
    setAvatarFileName(file.name);
  };

  const handleAvatarRemove = () => {
    handleAvatarChange(null);
    setAvatarPreview("");
    setAvatarFileName("");
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
        await getCurrentUser();
      } else {
        await handleCreateAddress(idx);
      }
    } catch (err: any) {
      showToast(err?.message || `Failed to update address ${idx + 1}`, "error");
    }
  };

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
      <section className="space-y-4 w-full overflow-hidden">
        {addresses.length === 0 ? (
          <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 text-center overflow-hidden">
            <MapPin size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">No addresses added yet</p>
            <Button type="button" variant="primary" onClick={handleAddAddress}>
              Add Your First Address
            </Button>
          </div>
        ) : (
          <>
            {addresses.map((address, idx) => (
              <div
                key={idx}
                className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header with title and delete button on right */}
                <div className="flex items-center justify-between gap-3 mb-6 w-full">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <MapPin size={20} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        Address {idx + 1}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">
                        {address.city && address.state
                          ? `${address.city}, ${address.state}`
                          : "Add location details"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(idx)}
                    className="flex-shrink-0 hover:bg-red-50"
                    title="Delete address"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full overflow-hidden">
                  <Input
                    label="City"
                    placeholder="e.g., New York"
                    value={address.city || ""}
                    onChange={(e) =>
                      handleAddressChange(idx, "city", e.target.value)
                    }
                  />
                  <Input
                    label="State"
                    placeholder="e.g., NY"
                    value={address.state || ""}
                    onChange={(e) =>
                      handleAddressChange(idx, "state", e.target.value)
                    }
                  />
                  <Input
                    label="Country"
                    placeholder="e.g., United States"
                    value={address.country || ""}
                    onChange={(e) =>
                      handleAddressChange(idx, "country", e.target.value)
                    }
                  />
                  <Input
                    label="ZIP Code"
                    placeholder="e.g., 10001"
                    value={address.zipCode || ""}
                    onChange={(e) =>
                      handleAddressChange(idx, "zipCode", e.target.value)
                    }
                  />
                </div>

                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end w-full gap-2 sm:gap-3">
                  {(address as any)?.id || (address as any)?._id ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateAddress(idx)}
                    >
                      <Edit2 size={16} className="mr-2" />
                      <span className="hidden sm:inline">Update Address</span>
                      <span className="sm:hidden">Update</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleCreateAddress(idx)}
                    >
                      Submit Address
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={handleAddAddress}
              disabled={addresses.length >= MAX_ALLOWED}
              className="w-full"
            >
              Add Another Address
            </Button>
          </>
        )}
      </section>
    );

  const clgInfos: CollegeInfo[] = useMemo(() => {
    if (!showStudentFields) return [];
    const ci = form.clgInfos || form.clgInfo;
    if (Array.isArray(ci)) return ci;
    if (ci && typeof ci === "object") return [ci];
    return [];
  }, [form, showStudentFields]);

  const handleAddClgInfo = () => {
    const currentCount = Array.isArray(form.clgInfos)
      ? form.clgInfos.length
      : form.clgInfo
        ? 1
        : 0;
    if (currentCount >= MAX_ALLOWED) {
      showToast(`Maximum ${MAX_ALLOWED} college infos allowed`, "error");
      return;
    }
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

  const handleUpdateClgInfo = async (idx: number) => {
    if (!user?.id) return;
    const clg = clgInfos[idx];
    const clgPayload = {
      collegeName: clg.collegeName,
      department: clg.department,
      session: clg.session,
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
        await getCurrentUser();
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
      <section className="space-y-4 w-full overflow-hidden">
        {clgInfos.length === 0 ? (
          <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 text-center overflow-hidden">
            <BookOpen size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">
              No college information added yet
            </p>
            <Button type="button" variant="primary" onClick={handleAddClgInfo}>
              Add College Information
            </Button>
          </div>
        ) : (
          <>
            {clgInfos.map((clg, idx) => (
              <div
                key={idx}
                className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header with title and delete button on right */}
                <div className="flex items-center justify-between gap-3 mb-6 w-full">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <BookOpen size={20} className="text-[#51356e]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        University / College {idx + 1}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">
                        {clg.collegeName || "Add college details"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClgInfo(idx)}
                    className="flex-shrink-0 hover:bg-red-50"
                    title="Delete college info"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full overflow-hidden">
                  <Input
                    label="University / College"
                    placeholder="e.g., Stanford University"
                    value={clg.collegeName || ""}
                    onChange={(e) =>
                      handleClgInfoChange(idx, "collegeName", e.target.value)
                    }
                  />
                  <Input
                    label="Department"
                    placeholder="e.g., Computer Science"
                    value={clg.department || ""}
                    onChange={(e) =>
                      handleClgInfoChange(idx, "department", e.target.value)
                    }
                  />
                  <Input
                    label="Session"
                    placeholder="e.g., Fall 2020"
                    value={clg.session || ""}
                    onChange={(e) =>
                      handleClgInfoChange(idx, "session", e.target.value)
                    }
                  />
                  <Input
                    label="Passing Year"
                    placeholder="e.g., 2024"
                    value={clg.passingYear || ""}
                    onChange={(e) =>
                      handleClgInfoChange(idx, "passingYear", e.target.value)
                    }
                  />
                </div>

                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end w-full gap-2 sm:gap-3">
                  {(clg as any)?.id || (clg as any)?._id ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleUpdateClgInfo(idx)}
                      className="w-full sm:w-auto"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Update
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleCreateClgInfo(idx)}
                      className="w-full sm:w-auto"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={handleAddClgInfo}
              disabled={clgInfos.length >= MAX_ALLOWED}
              className="w-full"
            >
              Add Another College
            </Button>
          </>
        )}
      </section>
    );

  return (
    <div className="w-full min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-4 sm:px-6 overflow-hidden">
      <ToastContainer position="top-right" newestOnTop />

      <div className="w-full max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-gray-200 w-full overflow-hidden">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words">
            Profile Settings
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">
            Manage your personal and professional information
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 w-full overflow-hidden"
        >
          {/* Tab Navigation - FIXED OVERFLOW */}
          <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-1 min-w-max sm:min-w-auto ${
                  activeTab === "profile"
                    ? "bg-[#51356e] text-white border-b-0"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <UserIcon size={16} className="flex-shrink-0" />
                Profile
              </button>
              {showStudentFields && (
                <>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-1 min-w-max sm:min-w-auto ${
                      activeTab === "address"
                        ? "bg-[#51356e] text-white border-b-0"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("address")}
                  >
                    <MapPin size={16} className="flex-shrink-0" />
                    Address
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-1 min-w-max sm:min-w-auto ${
                      activeTab === "college"
                        ? "bg-[#51356e] text-white border-b-0"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("college")}
                  >
                    <BookOpen size={16} className="flex-shrink-0" />
                    College Info
                  </button>
                </>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 md:p-6 w-full overflow-hidden">
              {activeTab === "profile" && renderProfileTab()}
              {activeTab === "address" && renderAddressTab()}
              {activeTab === "college" && renderCollegeTab()}
            </div>
          </div>

          {/* Action Buttons */}
          {activeTab === "profile" && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-4 w-full overflow-hidden">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm(initial)}
                disabled={saving || loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
