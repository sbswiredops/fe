"use client";
import React from 'react';
import Input from '@/components/ui/Input';

interface Props {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function CategoriesForm({ formData, onChange, setFormData }: Props) {
  return (
    <>
      <Input label="Category Name" name="name" value={formData.name || ''} onChange={onChange} placeholder="Enter category name" required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" value={formData.description || ''} onChange={onChange} placeholder="Enter category description" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (image/video)</label>
        <input type="file" name="categories_avatar" accept="image/*,video/*" onChange={onChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {formData.categories_avatar instanceof File && (<p className="mt-1 text-xs text-gray-500">Selected: {formData.categories_avatar.name}</p>)}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icon (image)</label>
        <input type="file" name="icon" accept="image/*" onChange={onChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {formData.icon instanceof File && (<p className="mt-1 text-xs text-gray-500">Selected: {formData.icon.name}</p>)}
      </div>
      <div className="flex items-center gap-2 pt-2">
        <input id="isActive" type="checkbox" checked={formData.isActive ?? (formData.status ? formData.status === 'active' : true)} onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
      </div>
    </>
  );
}
