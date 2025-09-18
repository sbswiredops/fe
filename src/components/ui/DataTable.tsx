"use client";

import React from "react";

type Primitive = string | number | boolean | null | undefined;

export type Column<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  tableClassName?: string;
}

function get(obj: any, path: string): Primitive {
  if (!path) return undefined;
  return path.split(".").reduce<any>((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  getRowKey,
  page,
  pageSize,
  totalItems,
  onPageChange,
  tableClassName = "min-w-full divide-y divide-gray-200",
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = clamp(page, 1, totalPages);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + pageSize, totalItems);

  const getPageNumbers = () => {
    const max = 5;
    const half = Math.floor(max / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, Math.min(start, end - max + 1));
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const goToPage = (p: number) => onPageChange(clamp(p, 1, totalPages));

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
            {rows.map((row, idx) => (
              <tr key={getRowKey(row, idx)} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-6 py-4 whitespace-nowrap ${col.className || ""}`}>
                    {col.render ? col.render(row) : (
                      <span className="text-sm text-gray-900">{String(get(row, String(col.key)) ?? "")}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 mt-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
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
                  p === currentPage ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </nav>

          <div className="text-xs sm:text-sm text-gray-600">
            {totalItems === 0 ? "0-0 of 0 items" : `${startIndex + 1}-${endIndex} of ${totalItems} items`}
          </div>
        </div>
      )}
    </div>
  );
}
