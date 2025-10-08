/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React from "react";
import Pagination from "./Pagination";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export interface ServerDataTableProps<T> {
  columns: Column<T>[];
  getRowKey: (row: T, index: number) => string;
  fetchPage: (params: {
    page: number;
    limit: number;
  }) => Promise<{ rows: T[]; total: number }>;
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
      const data: T[] = Array.isArray(result?.rows)
        ? result.rows
        : Array.isArray(result?.data?.rows)
        ? result.data.rows
        : Array.isArray(result?.users)
        ? result.users
        : Array.isArray(result?.data?.users)
        ? result.data.users
        : [];

      const totalItems: number =
        typeof result?.total === "number"
          ? result.total
          : typeof result?.data?.total === "number"
          ? result.data.total
          : data.length;

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid fetchPage result. Expected { rows: T[]; total: number }."
        );
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
    setPage(1);
  }, [depsString]);

  React.useEffect(() => {
    load();
  }, [load]);

  const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);
  const goToPage = (p: number) => setPage(clamp(p, 1, totalPages));




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
                <td
                  className="px-6 py-6 text-sm text-gray-500"
                  colSpan={columns.length}
                >
                  Loading...
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td
                  className="px-6 py-6 text-sm text-red-600"
                  colSpan={columns.length}
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td
                  className="px-6 py-6 text-sm text-gray-500"
                  colSpan={columns.length}
                >
                  No data found
                </td>
              </tr>
            )}

            {rows.map((row, idx) => (
              <tr key={getRowKey(row, idx)} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-6 py-4 whitespace-nowrap ${
                      col.className || ""
                    }`}
                  >
                    {col.render ? (
                      col.render(row)
                    ) : (
                      <span className="text-sm text-gray-900">
                        {String((row as any)[col.key as string] ?? "")}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={goToPage}
          className="mt-3"
        />
      )}
    </div>
  );
}
