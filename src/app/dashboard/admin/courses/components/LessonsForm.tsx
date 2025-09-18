"use client";
import React from 'react';
import Input from '@/components/ui/Input';

interface Props {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  sections: any[];
}

export default function LessonsForm({ formData, onChange, setFormData, sections }: Props) {
  return (
    <>
      <Input label="Lesson Title" name="title" value={formData.title || ''} onChange={onChange} placeholder="Enter lesson title" required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea name="content" value={formData.content || ''} onChange={onChange} placeholder="Enter lesson content" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
        <select name="sectionId" value={formData.sectionId || ''} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          <option value="">Select a section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>{section.title} ({section.courseName})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video</label>
          <input type="file" name="videoUrl" accept="video/*" onChange={onChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {formData.videoUrl instanceof File && (<p className="mt-1 text-xs text-gray-500">Selected: {formData.videoUrl.name}</p>)}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
          <input type="file" name="resourceUrl" accept="image/*,video/*,application/*" onChange={onChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {formData.resourceUrl instanceof File && (<p className="mt-1 text-xs text-gray-500">Selected: {formData.resourceUrl.name}</p>)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Duration (minutes)" name="duration" type="number" value={formData.duration || ''} onChange={onChange} placeholder="e.g., 15" required />
        <Input label="Order Index" name="orderIndex" type="number" value={formData.orderIndex || ''} onChange={onChange} placeholder="Order index" required />
      </div>
      <div className="flex items-center gap-6 pt-2">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isPublished" checked={!!formData.isPublished} onChange={(e) => setFormData((p: any) => ({ ...p, isPublished: e.target.checked }))} className="h-4 w-4" />
          <span className="text-sm text-gray-700">Published</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isFree" checked={!!formData.isFree} onChange={(e) => setFormData((p: any) => ({ ...p, isFree: e.target.checked }))} className="h-4 w-4" />
          <span className="text-sm text-gray-700">Free</span>
        </label>
      </div>
    </>
  );
}
