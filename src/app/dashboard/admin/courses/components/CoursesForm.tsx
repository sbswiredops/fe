"use client";
import React from "react";
import Input from "@/components/ui/Input";

interface Props {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[] | { items?: any[] } | undefined;
}

export default function CoursesForm({
  formData,
  onChange,
  setFormData,
  categories,
}: Props) {
  const categoryList = React.useMemo(() => {
    if (Array.isArray(categories)) return categories;
    if (categories && Array.isArray((categories as any).items))
      return (categories as any).items;
    return [];
  }, [categories]);

  return (
    <>
      <Input
        label="Course Title"
        name="title"
        value={formData.title || ""}
        onChange={onChange}
        placeholder="Enter course title"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
        <select
          name="courseType"
          value={formData.courseType || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a type</option>
          <option value="Recorded">Recorded</option>
          <option value="Free Live">Free Live</option>
          <option value="Upcoming Live">Upcoming Live</option>
          <option value="Featured Courses">Featured Courses</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription || ""}
          onChange={onChange}
          placeholder="Enter short description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={onChange}
          placeholder="Enter full course description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thumbnail
        </label>
        <input
          type="file"
          name="thumbnail"
          accept="image/*,video/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {formData.thumbnail instanceof File && (
          <p className="mt-1 text-xs text-gray-500">
            Selected: {formData.thumbnail.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="categoryId"
          value={formData.categoryId || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categoryList
            .filter((cat: any) => cat?.isActive !== false) // show active or unknown
            .map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          {categoryList.length === 0 && (
            <option value="" disabled>
              No categories available
            </option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          value={formData.price || ""}
          onChange={onChange}
          placeholder="Enter price"
          required
        />
        <Input
          label="Duration (minutes)"
          name="duration"
          type="number"
          value={formData.duration || ""}
          onChange={onChange}
          placeholder="e.g., 120"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            name="level"
            value={formData.level || "beginner"}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="flex items-center gap-6 pt-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={!!formData.isPublished}
              onChange={(e) =>
                setFormData((p: any) => ({
                  ...p,
                  isPublished: e.target.checked,
                }))
              }
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">Published</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={!!formData.isFeatured}
              onChange={(e) =>
                setFormData((p: any) => ({
                  ...p,
                  isFeatured: e.target.checked,
                }))
              }
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <textarea
            name="tags"
            rows={2}
            value={formData.tags || ""}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirements (comma separated)
          </label>
          <textarea
            name="requirements"
            rows={2}
            value={formData.requirements || ""}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Learning Outcomes (comma separated)
          </label>
          <textarea
            name="learningOutcomes"
            rows={2}
            value={formData.learningOutcomes || ""}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </>
  );
}
