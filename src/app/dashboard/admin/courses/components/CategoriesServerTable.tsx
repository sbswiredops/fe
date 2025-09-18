"use client";
import React from 'react';
import ServerDataTable from '@/components/ui/ServerDataTable';
import Button from '@/components/ui/Button';
import { categoryService } from '@/services/categoryService';
import { getStatusColor } from './AdminUtils';

interface Props {
  searchTerm: string;
  statusFilter: string;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  deps?: any[];
}

export default function CategoriesServerTable({ searchTerm, statusFilter, onView, onEdit, onDelete, deps = [] }: Props) {
  return (
    <ServerDataTable<any>
      columns={[
        { key: 'name', header: 'Name', render: (c: any) => <span className="text-sm font-medium text-gray-900">{c.name}</span> },
        { key: 'description', header: 'Description', render: (c: any) => <span className="text-sm text-gray-900 max-w-xs truncate block">{c.description}</span> },
        { key: 'status', header: 'Status', render: (c: any) => {
          const active = typeof c.isActive === 'boolean' ? c.isActive : (c.status ? c.status === 'active' : true);
          const label = active ? 'Active' : 'Inactive';
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(active ? 'active' : 'inactive')}`}>
              {label}
            </span>
          );
        } },
        { key: 'createdAt', header: 'Created', render: (c: any) => <span className="text-sm text-gray-900">{new Date(c.createdAt).toLocaleDateString()}</span> },
        { key: 'actions', header: 'Actions', render: (c: any) => (
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
            <Button size="sm" variant="ghost" onClick={() => onView(c)} className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start">View</Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(c)} className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(c)} className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start">Delete</Button>
          </div>
        ) },
      ]}
      getRowKey={(row) => row.id}
      fetchPage={async ({ page, limit }) => {
        const res = await categoryService.getCategories({ page, limit, search: searchTerm || undefined, status: statusFilter === 'all' ? undefined : statusFilter });
        return { rows: res.data || [], total: res.meta?.total || (res.data?.length || 0) };
      }}
      pageSize={8}
      deps={[searchTerm, statusFilter, ...deps]}
    />
  );
}
