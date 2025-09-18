"use client";
import React from 'react';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { getStatusColor } from './AdminUtils';

interface Props {
  rows: any[];
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

export default function SectionsTable({ rows, page, pageSize, totalItems, onPageChange, onView, onEdit, onDelete }: Props) {
  return (
    <DataTable
      columns={[
        { key: 'title', header: 'Section', render: (s: any) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{s.title}</div>
            <div className="text-sm text-gray-500 max-w-xs truncate">{s.description}</div>
          </div>
        ) },
        { key: 'courseName', header: 'Course', render: (s: any) => <span className="text-sm text-gray-900">{s.courseName}</span> },
        { key: 'order', header: 'Order', render: (s: any) => <span className="text-sm text-gray-900">{s.order}</span> },
        { key: 'lessonCount', header: 'Lessons', render: (s: any) => <span className="text-sm text-gray-900">{s.lessonCount}</span> },
        { key: 'status', header: 'Status', render: (s: any) => {
          const raw: any = s?.status ?? (s?.isActive === true ? 'active' : s?.isActive === false ? 'inactive' : 'active');
          const label = typeof raw === 'boolean' ? (raw ? 'active' : 'inactive') : String(raw || 'active');
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(label)}`}>
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </span>
          );
        } },
        { key: 'createdAt', header: 'Created', render: (s: any) => <span className="text-sm text-gray-900">{new Date(s.createdAt).toLocaleDateString()}</span> },
        { key: 'actions', header: 'Actions', render: (s: any) => (
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
            <Button size="sm" variant="ghost" onClick={() => onView(s)} className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start">View</Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(s)} className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(s)} className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start">Delete</Button>
          </div>
        ) },
      ]}
      rows={rows as any}
      getRowKey={(row: any) => row.id}
      page={page}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={onPageChange}
    />
  );
}
