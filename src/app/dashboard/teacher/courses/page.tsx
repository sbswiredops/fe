"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import DataTable, { Column } from "@/components/ui/DataTable";
import courseService, { CourseService } from "@/services/courseService";
import { Course } from "@/types/api";
import useToast from "@/components/hoock/toast";

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}

function TeacherCoursesContent() {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const svc = useMemo(() => new CourseService(), []);

  const load = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // We may not always get pagination meta from mock; compute fallback
      const res = await svc.getCourses({ instructorId: user.id, page, limit, search: search || undefined, status: status || undefined, sortBy: "createdAt", sortOrder: "desc" });
      const data = (res as any)?.data ?? [];
      const arr: Course[] = Array.isArray(data?.courses) ? data.courses : Array.isArray(data) ? data : [];
      setCourses(arr);
      const meta = (res as any)?.meta;
      const totalFromMeta = Number(meta?.total ?? meta?.totalItems ?? meta?.count ?? (Array.isArray(data?.courses) ? data.total : arr.length));
      setTotal(Number.isFinite(totalFromMeta) ? totalFromMeta : arr.length);
    } catch (e: any) {
      showToast(e?.message || "Failed to load courses", 'error');
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, page, limit, status]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const togglePublish = async (c: Course) => {
    try {
      setSubmitting(c.id);
      const target = (c.status === "published" || c.isPublished) ? "draft" : "published";
      const res = await svc.updateCourseStatus(c.id, target as any);
      if (res.success) {
        showToast(target === "published" ? "Course published" : "Moved to draft", 'success');
        await load();
      } else {
        showToast(res.error || "Failed to update status", 'error');
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update status", 'error');
    } finally {
      setSubmitting(null);
    }
  };

  const toggleFeatured = async (c: Course) => {
    try {
      setSubmitting(c.id);
      const res = await svc.toggleFeatured(c.id, !c.featured && !c.isFeatured);
      if (res.success) {
        showToast(!c.featured && !c.isFeatured ? "Marked as featured" : "Removed from featured", 'success');
        await load();
      } else {
        showToast(res.error || "Failed to toggle featured", 'error');
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to toggle featured", 'error');
    } finally {
      setSubmitting(null);
    }
  };

  const removeCourse = async (c: Course) => {
    try {
      if (!confirm(`Delete course: ${c.title}? This cannot be undone.`)) return;
      setSubmitting(c.id);
      const res = await svc.deleteCourse(c.id);
      if (res.success) {
        showToast("Course deleted", 'success');
        // If last item on page deleted, move up a page when possible
        const remaining = Math.max(0, total - 1);
        const maxPage = Math.max(1, Math.ceil(remaining / limit));
        if (page > maxPage) setPage(maxPage);
        await load();
      } else {
        showToast(res.error || "Failed to delete course", 'error');
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to delete course", 'error');
    } finally {
      setSubmitting(null);
    }
  };

  const columns: Column<Course>[] = [
    {
      key: "title",
      header: "Title",
      className: "max-w-[260px]",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.thumbnail} alt={r.title} className="w-12 h-12 rounded-md object-cover border border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
            <div className="text-xs text-gray-500 truncate">{r.category?.name || "Uncategorized"}</div>
          </div>
        </div>
      )
    },
    {
      key: "price",
      header: "Price",
      render: (r) => <span className="text-sm text-gray-900">{formatCurrency(r.price)}</span>
    },
    {
      key: "enrollmentCount",
      header: "Students",
      render: (r) => <span className="text-sm text-gray-900">{r.enrollmentCount}</span>
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => <span className="text-sm text-gray-900">{r.rating?.toFixed?.(1) ?? r.rating}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className={["px-2 py-1 rounded-full text-xs font-medium", (r.status === "published" || r.isPublished) ? "bg-green-100 text-green-800" : r.status === "archived" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-800"].join(" ")}> 
          {r.status || (r.isPublished ? "published" : "draft")}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/courses/${r.id}`} className="text-sm text-blue-600 hover:underline">View</Link>
          <button
            className="text-sm text-gray-700 hover:text-blue-700 px-2 py-1 rounded-md border border-gray-200 hover:border-blue-300"
            onClick={() => togglePublish(r)}
            disabled={submitting === r.id}
          >
            {(r.status === "published" || r.isPublished) ? "Move to Draft" : "Publish"}
          </button>
          <button
            className="text-sm text-gray-700 hover:text-blue-700 px-2 py-1 rounded-md border border-gray-200 hover:border-blue-300"
            onClick={() => toggleFeatured(r)}
            disabled={submitting === r.id}
          >
            {(r.featured || r.isFeatured) ? "Unfeature" : "Feature"}
          </button>
          <button
            className="text-sm text-red-600 hover:text-white hover:bg-red-600 px-2 py-1 rounded-md border border-red-200"
            onClick={() => removeCourse(r)}
            disabled={submitting === r.id}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600">Manage and organize your courses. Use filters to narrow results.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Keep visual style consistent; link can be wired when create flow exists */}
            <Button variant="outline">Create Course</Button>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={onSearchSubmit} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" size="sm">Search</Button>
            </div>
            <div>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg border border-gray-200 p-0">
          {loading ? (
            <div className="py-16"><Loading text="Loading courses..." /></div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No courses found.</div>
          ) : (
            <div className="overflow-hidden">
              <DataTable<Course>
                columns={columns}
                rows={courses}
                getRowKey={(r) => r.id}
                page={page}
                pageSize={limit}
                totalItems={total}
                onPageChange={(p) => setPage(p)}
                tableClassName="min-w-full divide-y divide-gray-200"
              />
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default function TeacherCoursesPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherCoursesContent />
    </ProtectedRoute>
  );
}
