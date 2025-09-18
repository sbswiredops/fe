/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React from "react";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export interface ServerDataTableProps<T> {
  columns: Column<T>[];
  getRowKey: (row: T, index: number) => string;
  fetchPage: (params: { page: number; limit: number }) => Promise<{ rows: T[]; total: number }>;
  pageSize?: number;
  deps?: any[];
  tableClassName?: string;
}

export default function ServerDataTable<T extends Record<string, any>>({
  columns,
  getRowKey,
  fetchPage,
  pageSize = 10,
  deps = [],
  tableClassName = "min-w-full divide-y divide-gray-200",
}: ServerDataTableProps<T>) {
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [rows, setRows] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const depsString = JSON.stringify(deps);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: any = await fetchPage({ page, limit: pageSize });

      // Normalize common shapes:
      const data: T[] =
        Array.isArray(result?.rows) ? result.rows :
        Array.isArray(result?.data?.rows) ? result.data.rows :
        Array.isArray(result?.users) ? result.users :
        Array.isArray(result?.data?.users) ? result.data.users :
        [];

      const totalItems: number =
        typeof result?.total === "number" ? result.total :
        typeof result?.data?.total === "number" ? result.data.total :
        data.length;

      if (!Array.isArray(data)) {
        throw new Error("Invalid fetchPage result. Expected { rows: T[]; total: number }.");
      }

      setRows(data);
      setTotal(totalItems);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, page, pageSize, depsString]);

  React.useEffect(() => {
    // Reset to page 1 when deps change
    setPage(1);
  }, [depsString]);

  React.useEffect(() => {
    load();
  }, [load]);

  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
  const goToPage = (p: number) => setPage(clamp(p, 1, totalPages));

  const startIndex = total === 0 ? 0 : (page - 1) * pageSize;
  const endIndex = total === 0 ? 0 : Math.min(startIndex + pageSize, total);

  const getPageNumbers = () => {
    const max = 5;
    const half = Math.floor(max / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, Math.min(start, end - max + 1));
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className={tableClassName}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && rows.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={columns.length}>
                  Loading...
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td className="px-6 py-6 text-sm text-red-600" colSpan={columns.length}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={columns.length}>
                  No data found
                </td>
              </tr>
            )}

            {rows.map((row, idx) => (
              <tr key={getRowKey(row, idx)} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-6 py-4 whitespace-nowrap ${col.className || ""}`}>
                    {col.render ? col.render(row) : (
                      <span className="text-sm text-gray-900">{String((row as any)[col.key as string] ?? "")}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="flex flex-col items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 mt-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={[
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-full text-sm font-medium",
                  p === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>

          <div className="text-xs sm:text-sm text-gray-600">
            {`${startIndex + 1}-${endIndex} of ${total} items`}
          </div>
        </div>
      )}
    </div>
  );
}