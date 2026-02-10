/* eslint-disable react-hooks/exhaustive-deps */
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
import { promoService, Promo, PromoType } from "@/services/promoService";

function PromoAdminPage() {
  const { showToast, ToastContainer } = useToast();

  const [promos, setPromos] = React.useState<Promo[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [refreshTick, setRefreshTick] = React.useState(0);

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Promo | null>(null);
  const [page, setPage] = React.useState(1);

  const [form, setForm] = React.useState<any>({
    code: "",
    type: PromoType.PERCENTAGE,
    value: 0,
    isActive: true,
    maxUses: undefined,
    validFrom: "",
    validTo: "",
  });

  const serverEnabled = Boolean(API_CONFIG.BASE_URL);

  const loadPromos = React.useCallback(async () => {
    try {
      setLoading(true);
      if (!serverEnabled) {
        setPromos([]);
        return;
      }
      const res = await promoService.listPromos({ page: 1, limit: 100 });
      if (res?.success) {
        // Support multiple response shapes
        let list: Promo[] = [];
        if (Array.isArray(res.data)) list = res.data as any;
        else if (res.data && Array.isArray((res.data as any).promos))
          list = (res.data as any).promos;
        else if (res.data && Array.isArray((res.data as any).items))
          list = (res.data as any).items;
        setPromos(list);
      } else {
        showToast(res?.error || "Failed to load promos", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to load promos", "error");
    } finally {
      setLoading(false);
    }
  }, [serverEnabled, refreshTick]);

  React.useEffect(() => {
    loadPromos();
  }, [loadPromos, refreshTick]);

  const openAdd = () => {
    setForm({
      code: "",
      type: PromoType.PERCENTAGE,
      value: 0,
      isActive: true,
      maxUses: undefined,
      validFrom: "",
      validTo: "",
    });
    setIsAddOpen(true);
  };

  const openEdit = (p: Promo) => {
    setSelected(p);
    setForm({
      code: p.code,
      type: p.type,
      value: Number(p.value || 0),
      isActive: !!p.isActive,
      maxUses: p.maxUses ?? undefined,
      validFrom: p.validFrom
        ? new Date(p.validFrom).toISOString().slice(0, 16)
        : "",
      validTo: p.validTo ? new Date(p.validTo).toISOString().slice(0, 16) : "",
    });
    setIsEditOpen(true);
  };

  const openView = (p: Promo) => {
    setSelected(p);
    setIsViewOpen(true);
  };

  const openDelete = (p: Promo) => {
    setSelected(p);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    try {
      const payload: any = {
        code: String(form.code || "").trim(),
        type: form.type,
        value: Number(form.value || 0),
        isActive: !!form.isActive,
        maxUses:
          form.maxUses === "" || form.maxUses == null
            ? undefined
            : Number(form.maxUses),
        validFrom: form.validFrom
          ? new Date(form.validFrom).toISOString()
          : undefined,
        validTo: form.validTo
          ? new Date(form.validTo).toISOString()
          : undefined,
      };
      const res = await promoService.createPromo(payload);
      if (res?.success) {
        showToast("Promo created", "success");
        setIsAddOpen(false);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res?.error || "Failed to create promo", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to create promo", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      const payload: any = {
        code: String(form.code || "").trim(),
        type: form.type,
        value: Number(form.value || 0),
        isActive: !!form.isActive,
        maxUses:
          form.maxUses === "" || form.maxUses == null
            ? undefined
            : Number(form.maxUses),
        validFrom: form.validFrom
          ? new Date(form.validFrom).toISOString()
          : undefined,
        validTo: form.validTo
          ? new Date(form.validTo).toISOString()
          : undefined,
      };
      const res = await promoService.updatePromo(selected.id, payload);
      if (res?.success) {
        showToast("Promo updated", "success");
        setIsEditOpen(false);
        setSelected(null);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res?.error || "Failed to update promo", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update promo", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await promoService.deletePromo(selected.id);
      if (res?.success) {
        showToast("Promo deleted", "success");
        setIsDeleteOpen(false);
        setSelected(null);
        setRefreshTick((x) => x + 1);
      } else {
        showToast(res?.error || "Failed to delete promo", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete promo", "error");
    }
  };

  const columns = React.useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        render: (r: Promo) => <span className="font-medium">{r.code}</span>,
      },
      {
        key: "type",
        header: "Type",
        render: (r: Promo) => <span>{r.type}</span>,
      },
      {
        key: "value",
        header: "Value",
        render: (r: Promo) => (
          <span>
            {r.type === PromoType.PERCENTAGE ? `${r.value}%` : `৳${r.value}`}
          </span>
        ),
      },
      {
        key: "isActive",
        header: "Active",
        render: (r: Promo) => <span>{r.isActive ? "Yes" : "No"}</span>,
      },
      {
        key: "maxUses",
        header: "Max Uses",
        render: (r: Promo) => <span>{r.maxUses ?? "-"}</span>,
      },
      {
        key: "usedCount",
        header: "Used",
        render: (r: Promo) => <span>{r.usedCount ?? 0}</span>,
      },
      {
        key: "validFrom",
        header: "Valid From",
        render: (r: Promo) => (
          <span>
            {r.validFrom ? new Date(r.validFrom).toLocaleString() : "-"}
          </span>
        ),
      },
      {
        key: "validTo",
        header: "Valid To",
        render: (r: Promo) => (
          <span>{r.validTo ? new Date(r.validTo).toLocaleString() : "-"}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r: Promo) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => openView(r)}>
              View
            </Button>
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openDelete(r)}
              className="text-red-600"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Promos</h1>
            <p className="text-sm text-gray-600">Manage promotional codes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openAdd} className="flex items-center gap-2">
              Add Promo
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="p-4">
            <DataTable
              columns={columns}
              rows={promos as any}
              getRowKey={(r: any) => r.id}
              page={page}
              pageSize={100}
              totalItems={promos.length}
              onPageChange={(newPage: number) => setPage(newPage)}
            />
          </div>
        </div>

        {/* Add Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add Promo"
        >
          <div className="space-y-3">
            <Input
              label="Code"
              value={form.code}
              onChange={(e: any) =>
                setForm((p: any) => ({ ...p, code: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 border rounded"
                value={form.type}
                onChange={(e: any) =>
                  setForm((p: any) => ({ ...p, type: e.target.value }))
                }
              >
                <option value={PromoType.PERCENTAGE}>Percentage</option>
                <option value={PromoType.FIXED}>Fixed</option>
              </select>
              <Input
                type="number"
                label="Value"
                value={form.value}
                onChange={(e: any) =>
                  setForm((p: any) => ({ ...p, value: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, isActive: e.target.checked }))
                  }
                />{" "}
                Active
              </label>
              <Input
                type="number"
                label="Max Uses"
                value={form.maxUses ?? ""}
                onChange={(e: any) =>
                  setForm((p: any) => ({ ...p, maxUses: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">
                  Valid From
                </label>
                <input
                  type="datetime-local"
                  className="w-full border px-3 py-2 rounded"
                  value={form.validFrom}
                  onChange={(e: any) =>
                    setForm((p: any) => ({ ...p, validFrom: e.target.value }))
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">
                  Valid To
                </label>
                <input
                  type="datetime-local"
                  className="w-full border px-3 py-2 rounded"
                  value={form.validTo}
                  onChange={(e: any) =>
                    setForm((p: any) => ({ ...p, validTo: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="danger" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelected(null);
          }}
          title="Edit Promo"
        >
          <div className="space-y-3">
            <Input
              label="Code"
              value={form.code}
              onChange={(e: any) =>
                setForm((p: any) => ({ ...p, code: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 border rounded"
                value={form.type}
                onChange={(e: any) =>
                  setForm((p: any) => ({ ...p, type: e.target.value }))
                }
              >
                <option value={PromoType.PERCENTAGE}>Percentage</option>
                <option value={PromoType.FIXED}>Fixed</option>
              </select>
              <Input
                type="number"
                label="Value"
                value={form.value}
                onChange={(e: any) =>
                  setForm((p: any) => ({ ...p, value: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, isActive: e.target.checked }))
                  }
                />{" "}
                Active
              </label>
              <Input
                type="number"
                label="Max Uses"
                value={form.maxUses ?? ""}
                onChange={(e: any) =>
                  setForm((p: any) => ({ ...p, maxUses: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">
                  Valid From
                </label>
                <input
                  type="datetime-local"
                  className="w-full border px-3 py-2 rounded"
                  value={form.validFrom}
                  onChange={(e: any) =>
                    setForm((p: any) => ({ ...p, validFrom: e.target.value }))
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">
                  Valid To
                </label>
                <input
                  type="datetime-local"
                  className="w-full border px-3 py-2 rounded"
                  value={form.validTo}
                  onChange={(e: any) =>
                    setForm((p: any) => ({ ...p, validTo: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="danger"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelected(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelected(null);
          }}
          title="View Promo"
        >
          {selected ? (
            <div className="space-y-3">
              <div>
                <strong>Code:</strong> {selected.code}
              </div>
              <div>
                <strong>Type:</strong> {selected.type}
              </div>
              <div>
                <strong>Value:</strong>{" "}
                {selected.type === PromoType.PERCENTAGE
                  ? `${selected.value}%`
                  : `৳${selected.value}`}
              </div>
              <div>
                <strong>Active:</strong> {selected.isActive ? "Yes" : "No"}
              </div>
              <div>
                <strong>Max Uses:</strong> {selected.maxUses ?? "-"}
              </div>
              <div>
                <strong>Used Count:</strong> {selected.usedCount ?? 0}
              </div>
              <div>
                <strong>Valid From:</strong>{" "}
                {selected.validFrom
                  ? new Date(selected.validFrom).toLocaleString()
                  : "-"}
              </div>
              <div>
                <strong>Valid To:</strong>{" "}
                {selected.validTo
                  ? new Date(selected.validTo).toLocaleString()
                  : "-"}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => {
                    setIsViewOpen(false);
                    setSelected(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelected(null);
          }}
          onConfirm={handleDelete}
          title="Delete Promo"
          message={`Delete promo '${selected?.code}'? This action cannot be undone.`}
          type="danger"
        />

        <ToastContainer position="bottom-right" />
      </div>
    </DashboardLayout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PromoAdminPage />
    </ProtectedRoute>
  );
}
