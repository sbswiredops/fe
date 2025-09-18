"use client";
import React from 'react';
import ServerDataTable from '@/components/ui/ServerDataTable';
import Button from '@/components/ui/Button';
import { getStatusColor } from './AdminUtils';
import LessonService from '@/services/lessonService';

interface Props {
  searchTerm?: string;
  courseId?: string;
  sectionId?: string;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  deps?: any[];
}

export default function LessonsTable({
  searchTerm,
  courseId,
  sectionId,
  onView,
  onEdit,
  onDelete,
  deps = [],
}: Props) {
  const safeDuration = (d: any) => (Number.isFinite(d) ? `${d} min` : '0 min');
  const safeOrder = (o: any) => (Number.isFinite(o) ? o : 0);

  return (
    <ServerDataTable<any>
      columns={[
        {
          key: 'title',
          header: 'Lesson',
          render: (l: any) => (
            <div>
              <div className="text-sm font-medium text-gray-900">{l.title || 'Untitled lesson'}</div>
              <div className="text-sm text-gray-500 max-w-xs truncate">{l.content || ''}</div>
            </div>
          ),
        },
        {
          key: 'sectionName',
          header: 'Section',
          render: (l: any) => (
            <div>
              <div className="text-sm text-gray-900">{l.section?.title ?? l.sectionName ?? '—'}</div>
              <div className="text-sm text-gray-500">{l.section?.course?.title ?? l.courseName ?? ''}</div>
            </div>
          ),
        },
        { key: 'duration', header: 'Duration', render: (l: any) => <span className="text-sm text-gray-900">{safeDuration(l.duration)}</span> },
        { key: 'orderIndex', header: 'Order', render: (l: any) => <span className="text-sm text-gray-900">{safeOrder(l.orderIndex)}</span> },
        {
          key: 'isPublished',
          header: 'Published',
          render: (l: any) => (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(l.isPublished ? 'published' : 'draft')}`}>
              {l.isPublished ? 'Published' : 'Draft'}
            </span>
          ),
        },
        {
          key: 'isFree',
          header: 'Free',
          render: (l: any) => (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${l.isFree ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {l.isFree ? 'Yes' : 'No'}
            </span>
          ),
        },
        {
          key: 'actions',
          header: 'Actions',
          render: (l: any) => (
            <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onView(l)}
                className="text-blue-600 hover:text-blue-900 w-full md:w-auto justify-center md:justify-start"
              >
                View
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(l)}
                className="text-yellow-600 hover:text-yellow-900 w-full md:w-auto justify-center md:justify-start"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(l)}
                className="text-red-600 hover:text-red-900 w-full md:w-auto justify-center md:justify-start"
              >
                Delete
              </Button>
            </div>
          ),
        },
      ]}
      getRowKey={(row: any) => row.id ?? row._id}
      fetchPage={async ({ page, limit }) => {
        const res: any = await LessonService.getLessons({
          page,
          limit,
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(courseId ? { courseId } : {}),
          ...(sectionId ? { sectionId } : {}),
        });

        const raw: any[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.lessons)
          ? res.data.lessons
          : Array.isArray(res?.lessons)
          ? res.lessons
          : [];

        const rows = raw.map((l: any) => ({
          ...l,
          sectionName: l?.section?.title ?? l?.sectionName ?? '',
          courseName: l?.section?.course?.title ?? l?.courseName ?? '',
        }));

        const total: number =
          (res?.meta?.total ??
            res?.data?.total ??
            res?.data?.meta?.total ??
            rows.length) as number;

        return { rows, total };
      }}
      pageSize={8}
      deps={[searchTerm, courseId, sectionId, ...deps]}
    />
  );
}