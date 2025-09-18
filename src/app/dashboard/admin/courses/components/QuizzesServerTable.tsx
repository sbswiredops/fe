import React from 'react';
import ServerDataTable from '@/components/ui/ServerDataTable';
import Button from '@/components/ui/Button';
import { quizService } from '@/services/quizService';

interface Props {
  searchTerm: string;
  statusFilter: string;
  courseId?: string;
  sectionId?: string;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  deps?: any[];
}

export default function QuizzesServerTable({ searchTerm, statusFilter, courseId, sectionId, onView, onEdit, onDelete, deps = [] }: Props) {
  return (
    <ServerDataTable<any>
      columns={[
        { key: 'title', header: 'Title', render: (q: any) => <span className="text-sm font-medium text-gray-900">{q.title}</span> },
        { key: 'course', header: 'Course', render: (q: any) => <span className="text-sm text-gray-900">{q.course?.title || q.courseName || '-'}</span> },
        { key: 'section', header: 'Section', render: (q: any) => <span className="text-sm text-gray-900">{q.section?.title || q.sectionName || '-'}</span> },
        { key: 'isLocked', header: 'Locked', render: (q: any) => (
          <span className="text-sm text-gray-900">{q.isLocked ? 'Yes' : 'No'}</span>
        ) },
        { key: 'isPaid', header: 'Paid', render: (q: any) => <span className="text-sm text-gray-900">{q.isPaid ? 'Yes' : 'No'}</span> },
        { key: 'price', header: 'Price', render: (q: any) => <span className="text-sm text-gray-900">{typeof q.price === 'number' ? `$${q.price}` : '-'}</span> },
        { key: 'createdAt', header: 'Created', render: (q: any) => <span className="text-sm text-gray-900">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '-'}</span> },
        { key: 'actions', header: 'Actions', render: (q: any) => (
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
            <Button size="sm" variant="ghost" onClick={() => onView(q)} className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start">View</Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(q)} className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(q)} className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start">Delete</Button>
          </div>
        ) },
      ]}
      getRowKey={(row) => row.id}
      fetchPage={async ({ page, limit }) => {
        const res = await quizService.list({ page, limit, search: searchTerm || undefined, courseId, sectionId });
        return { rows: res.data || [], total: res.meta?.total || (res.data?.length || 0) };
      }}
      pageSize={8}
      deps={[searchTerm, statusFilter, courseId, sectionId, ...deps]}
    />
  );
}
