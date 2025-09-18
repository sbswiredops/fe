"use client";
import React from 'react';
import Input from '@/components/ui/Input';

interface Props {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  courses: any[] | { items?: any[] } | { data?: { courses?: any[] } };
}

export default function SectionsForm({ formData, onChange, courses }: Props) {
  const courseList = React.useMemo(() => {
    if (Array.isArray(courses)) return courses;
    const items = (courses as any)?.items;
    if (Array.isArray(items)) return items;
    const nested = (courses as any)?.data?.courses;
    if (Array.isArray(nested)) return nested;
    return [];
  }, [courses]);

  const publishedCourses = React.useMemo(
    () =>
      courseList.filter((c: any) =>
        typeof c?.isPublished === 'boolean'
          ? c.isPublished
          : String(c?.status || '').toLowerCase() === 'published'
      ),
    [courseList]
  );

  return (
    <>
      <Input
        label="Section Title"
        name="title"
        value={formData.title || ''}
        onChange={onChange}
        placeholder="Enter section title"
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={onChange}
          placeholder="Enter section description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
        <select
          name="courseId"
          value={formData.courseId || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a course</option>
          {publishedCourses.length === 0 ? (
            <option value="" disabled>No published courses available</option>
          ) : (
            publishedCourses.map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Order"
          name="order"
          type="number"
          value={formData.order || ''}
          onChange={onChange}
          placeholder="Section order"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status || 'active'}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </>
  );
}