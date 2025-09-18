import React from 'react';
import Input from '@/components/ui/Input';

interface Props {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  courses: any[];
  sections: any[];
}

export default function QuizzesForm({ formData, onChange, setFormData, courses, sections }: Props) {
  const courseSections = React.useMemo(() => {
    if (!formData.courseId) return sections;
    return sections.filter((s) => s.courseId === formData.courseId);
  }, [sections, formData.courseId]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <select
            name="courseId"
            value={formData.courseId || ''}
            onChange={(e) => {
              setFormData((p: any) => ({ ...p, courseId: e.target.value || undefined, sectionId: '' }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Optional: Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            name="sectionId"
            value={formData.sectionId || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Optional: Select section</option>
            {courseSections.map((s) => (
              <option key={s.id} value={s.id}>{s.title}{s.courseName ? ` (${s.courseName})` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <Input label="Quiz Title" name="title" value={formData.title || ''} onChange={onChange} placeholder="Enter quiz title" required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={onChange}
          placeholder="Enter quiz description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Price" name="price" type="number" value={formData.price ?? ''} onChange={onChange} placeholder="e.g., 0" />
        <div className="flex items-center gap-3 pt-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isLocked" checked={!!formData.isLocked} onChange={(e) => setFormData((p: any) => ({ ...p, isLocked: e.target.checked }))} className="h-4 w-4" />
            <span className="text-sm text-gray-700">Locked</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="isPaid" checked={!!formData.isPaid} onChange={(e) => setFormData((p: any) => ({ ...p, isPaid: e.target.checked }))} className="h-4 w-4" />
            <span className="text-sm text-gray-700">Paid</span>
          </label>
        </div>
      </div>
    </>
  );
}
