import React from 'react';
import ServerDataTable from '@/components/ui/ServerDataTable';
import Button from '@/components/ui/Button';
import { certificateService } from '@/services/certificateService';

interface Props {
  searchTerm: string;
  userId?: string;
  courseId?: string;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  deps?: any[];
}

export default function CertificatesServerTable({ searchTerm, userId, courseId, onView, onEdit, onDelete, deps = [] }: Props) {
  return (
    <ServerDataTable<any>
      columns={[
        { key: 'certificateCode', header: 'Code', render: (c: any) => <span className="text-sm text-gray-900">{c.certificateCode || '-'}</span> },
        { key: 'user', header: 'User', render: (c: any) => <span className="text-sm text-gray-900">{c.user?.firstName ? `${c.user.firstName} ${c.user.lastName || ''}`.trim() : c.userId}</span> },
        { key: 'course', header: 'Course', render: (c: any) => <span className="text-sm text-gray-900">{c.course?.title || c.courseId}</span> },
        { key: 'issuedAt', header: 'Issued', render: (c: any) => <span className="text-sm text-gray-900">{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '-'}</span> },
        { key: 'certificateUrl', header: 'URL', render: (c: any) => c.certificateUrl ? <a className="text-sm text-blue-600 underline" href={c.certificateUrl} target="_blank" rel="noreferrer">Open</a> : <span className="text-sm text-gray-500">-</span> },
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
        if (!userId && !courseId) {
          return { rows: [], total: 0 };
        }
        const res = await certificateService.list({ page, limit, search: searchTerm || undefined, userId: userId || undefined, courseId: courseId || undefined });
        return { rows: res.data || [], total: res.meta?.total || (res.data?.length || 0) };
      }}
      pageSize={8}
      deps={[searchTerm, userId, courseId, ...deps]}
    />
  );
}
