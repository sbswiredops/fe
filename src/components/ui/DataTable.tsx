"use client";

import React from "react";
import Pagination from "@/components/ui/Pagination";

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
  return path
    .split(".")
    .reduce<any>((acc, key) => (acc == null ? acc : acc[key]), obj);
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
                        {String(get(row, String(col.key)) ?? "")}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Use new Pagination component */}
      {totalItems > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          maxPagesToShow={5}
          className="mt-3"
          showRange={true}
        />
      )}
    </div>
  );
}
