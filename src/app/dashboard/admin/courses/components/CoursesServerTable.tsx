"use client";
import React from 'react';
import ServerDataTable from '@/components/ui/ServerDataTable';
import Button from '@/components/ui/Button';
import CourseService from '@/services/courseService';
import { getLevelColor, getStatusColor } from './AdminUtils';

interface Props {
  searchTerm: string;
  statusFilter: string;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  deps?: any[];
}

export default function CoursesServerTable({ searchTerm, statusFilter, onView, onEdit, onDelete, deps = [] }: Props) {
  return (
    <ServerDataTable<any>
      columns={[
        { key: 'title', header: 'Course', render: (course: any) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{course.title}</div>
            <div className="text-sm text-gray-500">{course.duration} • {(course.sectionCount ?? course.totalLessons) || 0} sections</div>
          </div>
        ) },
        { key: 'categoryName', header: 'Category', render: (c: any) => <span className="text-sm text-gray-900">{c.category?.name || c.categoryName}</span> },
        { key: 'instructor', header: 'Instructor', render: (c: any) => <span className="text-sm text-gray-900">{c.instructor?.name || c.instructor}</span> },
        { key: 'courseType', header: 'Type', render: (c: any) => <span className="text-sm text-gray-900">{c.courseType || '-'}</span> },
        { key: 'price', header: 'Price', render: (c: any) => <span className="text-sm text-gray-900">${c.price}</span> },
        { key: 'level', header: 'Level', render: (c: any) => (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(c.level)}`}>
            {c.level?.charAt(0).toUpperCase() + c.level?.slice(1)}
          </span>
        ) },
        { key: 'status', header: 'Status', render: (c: any) => {
          const label = typeof c.isPublished === 'boolean' ? (c.isPublished ? 'Published' : 'Draft') : (c.status?.charAt(0).toUpperCase() + c.status?.slice(1));
          const colorKey = typeof c.isPublished === 'boolean' ? (c.isPublished ? 'published' : 'draft') : (c.status || 'draft');
          return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(colorKey)}`}>
              {label}
            </span>
          );
        } },
        { key: 'enrollments', header: 'Enrollments', render: (c: any) => <span className="text-sm text-gray-900">{c.enrollmentCount ?? c.enrollments}</span> },
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
        const res: any = await CourseService.getCourses({ page, limit, search: searchTerm || undefined, status: statusFilter === 'all' ? undefined : statusFilter });
        const rows: any[] = Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.data?.courses) ? res.data.courses : (Array.isArray(res?.courses) ? res.courses : []));
        const total: number = (res?.meta?.total ?? res?.data?.total ?? rows.length) as number;
        return { rows, total };
      }}
      pageSize={8}
      deps={[searchTerm, statusFilter, ...deps]}
    />
  );
}
