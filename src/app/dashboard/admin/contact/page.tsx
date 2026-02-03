"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import contactService from "@/services/contactService";
import useToast from "@/components/hoock/toast";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

type ContactItem = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  status?: string;
  isRead?: boolean;
  isArchived?: boolean;
  createdAt?: string;
};

export default function AdminContactPage() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await contactService.listContacts();
      console.debug("[AdminContact] raw response:", res);
      const resData = (res && (res.data ?? res)) || {};

      // Try multiple common paths to locate the contacts array in the response
      const candidates: any[] = [];
      if (Array.isArray(resData)) candidates.push(resData);
      if (resData && Array.isArray((resData as any).contacts))
        candidates.push((resData as any).contacts);
      if (res && Array.isArray((res as any).contacts))
        candidates.push((res as any).contacts);
      if (resData && Array.isArray((resData as any).items))
        candidates.push((resData as any).items);
      if (res && Array.isArray((res as any).data?.contacts))
        candidates.push((res as any).data.contacts);
      if (res && Array.isArray((res as any).data?.data?.contacts))
        candidates.push((res as any).data.data.contacts);

      const contacts = candidates.length > 0 ? candidates[0] : [];
      console.debug("[AdminContact] extracted contacts:", contacts);

      setItems(
        (contacts || []).map((c: any) => ({
          id: c.id || c._id || c.contactId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          subject: c.subject,
          message: c.message,
          status: c.status,
          createdAt: c.createdAt,
        })),
      );
    } catch (err: any) {
      showToast(err?.message || "Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = () => load();

  const handleMarkRead = async (id: string) => {
    // legacy: replaced by modal flow
    setActionLoading(id);
    try {
      const res = await contactService.markAsRead(id);
      if (res?.success) showToast("Marked as read", "success");
      else showToast(res?.message || "Failed", "error");
      await refresh();
    } catch (err: any) {
      showToast(err?.message || "Error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id: string) => {
    // legacy: replaced by modal flow
    setActionLoading(id);
    try {
      const res = await contactService.archiveContact(id);
      if (res?.success) showToast("Archived", "success");
      else showToast(res?.message || "Failed", "error");
      await refresh();
    } catch (err: any) {
      showToast(err?.message || "Error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    // legacy: replaced by modal flow
    setActionLoading(id);
    try {
      const res = await contactService.deleteContact(id);
      if (res?.success) showToast("Deleted", "success");
      else showToast(res?.message || "Failed", "error");
      await refresh();
    } catch (err: any) {
      showToast(err?.message || "Error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Modal state for confirmations
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: "mark" | "archive" | "delete" | null;
    id: string | null;
  }>({ open: false, action: null, id: null });

  const openConfirm = (action: "mark" | "archive" | "delete", id: string) => {
    setConfirmState({ open: true, action, id });
  };

  const closeConfirm = () =>
    setConfirmState({ open: false, action: null, id: null });

  const onConfirm = async () => {
    const { action, id } = confirmState;
    if (!action || !id) {
      closeConfirm();
      return;
    }
    closeConfirm();
    if (action === "mark") return handleMarkRead(id);
    if (action === "archive") return handleArchive(id);
    if (action === "delete") return handleDelete(id);
  };

  const truncate = (s?: string, n = 80) =>
    s && s.length > n ? s.slice(0, n) + "…" : s || "";

  return (
    <>
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Contact Messages
            </h2>
            <button
              onClick={refresh}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded shadow-sm overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Name
                  </th>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Email
                  </th>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Subject
                  </th>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Message
                  </th>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Status
                  </th>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Date
                  </th>
                  <th className="p-3 text-left text-gray-800 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-800">
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-800">
                      No messages
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-3 text-gray-900">{it.name || "—"}</td>
                      <td className="p-3 text-gray-900">{it.email || "—"}</td>
                      <td className="p-3 text-gray-900">{it.subject || "—"}</td>
                      <td className="p-3 max-w-xl text-gray-900">
                        {truncate(it.message, 120)}
                      </td>
                      <td className="p-3 text-gray-900">
                        {it.status
                          ? it.status
                          : it.isArchived
                            ? "Archived"
                            : it.isRead
                              ? "Read"
                              : "Unread"}
                      </td>
                      <td className="p-3 text-gray-900">
                        {it.createdAt
                          ? new Date(it.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => openConfirm("mark", it.id)}
                          disabled={actionLoading === it.id}
                          className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                        >
                          {actionLoading === it.id ? "…" : "Mark Read"}
                        </button>
                        <button
                          onClick={() => openConfirm("archive", it.id)}
                          disabled={actionLoading === it.id}
                          className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => openConfirm("delete", it.id)}
                          disabled={actionLoading === it.id}
                          className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      {/* Confirmation modal for actions */}
      <ConfirmationModal
        isOpen={confirmState.open}
        onClose={closeConfirm}
        onConfirm={onConfirm}
        title={
          confirmState.action === "mark"
            ? "Mark message as read"
            : confirmState.action === "archive"
              ? "Archive message"
              : confirmState.action === "delete"
                ? "Delete message"
                : ""
        }
        message={
          confirmState.action === "mark"
            ? "Are you sure you want to mark this message as read?"
            : confirmState.action === "archive"
              ? "Are you sure you want to archive this message?"
              : confirmState.action === "delete"
                ? "This will permanently delete the message. This action cannot be undone."
                : ""
        }
        confirmText={
          confirmState.action === "mark"
            ? "Mark Read"
            : confirmState.action === "archive"
              ? "Archive"
              : confirmState.action === "delete"
                ? "Delete"
                : "OK"
        }
        cancelText={"Cancel"}
        type={
          confirmState.action === "delete"
            ? "danger"
            : confirmState.action === "archive"
              ? "warning"
              : "info"
        }
      />
    </>
  );
}
