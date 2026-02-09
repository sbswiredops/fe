"use client";
import React from "react";
import Input from "@/components/ui/Input";

interface Props {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[] | { items?: any[] } | undefined;
  instructors?: any[] | { items?: any[] } | undefined;
}

// Add this helper function above your component
function getDiscountPrice(
  price: number,
  discountPercentage: number | "" | undefined | null,
): number | "" | null {
  // If the discount percentage is explicitly empty/undefined, return empty
  if (discountPercentage === "" || discountPercentage === undefined) return "";
  // If it's explicitly null, return null to indicate intentional null
  if (discountPercentage === null) return null;
  const percent = Number(discountPercentage);
  if (Number.isNaN(percent)) return "";
  // treat 0 as 0% (no discount)
  return Math.round((price * (100 - percent)) / 100);
}

export default function CoursesForm({
  formData,
  onChange,
  setFormData,
  categories,
  instructors,
}: Props) {
  // Track whether the SKU was manually edited by the user.
  const [skuManuallyEdited, setSkuManuallyEdited] = React.useState(false);
  // Helper to convert title -> sku (slug)
  const slugify = (str: string) =>
    String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-_.]/g, "") // allow alnum, spaces, dash, underscore, dot
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100);

  // Auto-populate `sku` from title when sku is empty
  React.useEffect(() => {
    const title = formData.title || "";
    // Only auto-generate SKU when user hasn't manually edited it.
    if (title && !skuManuallyEdited) {
      const generated = slugify(title);
      setFormData((prev: any) => ({ ...prev, sku: generated }));
    }
    // run when title or manual-edit flag changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, skuManuallyEdited]);
  const categoryList = React.useMemo(() => {
    if (Array.isArray(categories)) return categories;
    if (categories && Array.isArray((categories as any).items))
      return (categories as any).items;
    return [];
  }, [categories]);

  const instructorList = React.useMemo(() => {
    if (!instructors) return [];
    if (Array.isArray(instructors)) return instructors;
    if (instructors && Array.isArray((instructors as any).items))
      return (instructors as any).items;
    return [];
  }, [instructors]);

  // Auto-calculate discountPrice when price or discountPercentage changes
  React.useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const raw = formData.discountPercentage;
    // If the user cleared the discountPercentage input (empty string or undefined), keep discountPrice empty
    if (raw === "" || raw === undefined) {
      setFormData((prev: any) => ({ ...prev, discountPrice: "" }));
      return;
    }
    // If discountPercentage is explicitly null, set discountPrice to null as well
    if (raw === null) {
      setFormData((prev: any) => ({ ...prev, discountPrice: null }));
      return;
    }
    const discountPercentage = Number(raw);
    const discountPrice = getDiscountPrice(price, discountPercentage);
    setFormData((prev: any) => ({
      ...prev,
      discountPrice: discountPrice ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.price, formData.discountPercentage]);

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

      <Input
        label="SKU"
        name="sku"
        value={formData.sku || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const v = e.target.value;
          setFormData((p: any) => ({ ...p, sku: v }));
          setSkuManuallyEdited(v !== "");
        }}
        placeholder="Auto generated from title (editable)"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Type
        </label>
        <select
          name="type" // changed from courseType -> type to match entity field
          value={formData.type || ""}
          onChange={(e) => {
            (e.target as HTMLSelectElement).setCustomValidity("");
            onChange(e as any);
          }}
          onInvalid={(e) =>
            (e.target as HTMLSelectElement).setCustomValidity(
              "Please select the course type",
            )
          }
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
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
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#51356e]  hover:file:bg-blue-100"
        />
        {formData.thumbnail instanceof File && (
          <p className="mt-1 text-xs text-gray-500">
            Selected: {formData.thumbnail.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Intro Video (YouTube / external URL)
        </label>
        <input
          type="url"
          name="courseIntroVideo"
          value={
            typeof formData.courseIntroVideo === "string"
              ? formData.courseIntroVideo
              : ""
          }
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              courseIntroVideo: e.target.value,
            }))
          }
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
        />
        {typeof formData.courseIntroVideo === "string" &&
          formData.courseIntroVideo && (
            <p className="mt-1 text-xs text-gray-500 break-all">
              Current video URL: {formData.courseIntroVideo}
            </p>
          )}
        <p className="mt-1 text-xs text-gray-500">
          Paste a YouTube or external video URL. File uploads for intro video
          are removed.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="categoryId"
          value={formData.categoryId || ""}
          onChange={(e) => {
            // clear any previous custom validity message then call parent onChange
            (e.target as HTMLSelectElement).setCustomValidity("");
            onChange(e as any);
          }}
          onInvalid={(e) =>
            (e.target as HTMLSelectElement).setCustomValidity(
              "Please select the category",
            )
          }
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructor
        </label>
        <select
          name="instructorId"
          value={formData.instructorId || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
        >
          <option value="">Select an instructor</option>
          {instructorList.length > 0
            ? instructorList.map((instr: any) => {
                const label =
                  instr.name ||
                  instr.fullName ||
                  instr.email ||
                  `${instr.firstName || ""} ${instr.lastName || ""}`;
                return (
                  <option key={instr.id} value={instr.id}>
                    {label}
                  </option>
                );
              })
            : null}
          {instructorList.length === 0 && (
            <option value="" disabled>
              No instructors available
            </option>
          )}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price || ""}
          onChange={onChange}
          placeholder="Enter price"
          required
        />
        <Input
          label="Discount Percentage"
          name="discountPercentage"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.discountPercentage ?? ""}
          onChange={onChange}
          placeholder="Enter discount percentage"
        />
        <Input
          label="Discount Price"
          name="discountPrice"
          type="number"
          step="0.01"
          value={formData.discountPrice ?? ""}
          readOnly
          placeholder="Auto calculated"
        />
      </div>

      {/* Keep duration input somewhere if needed */}
      <Input
        label="Duration (minutes)"
        name="duration"
        type="number"
        value={formData.duration || ""}
        onChange={onChange}
        placeholder="e.g., 120"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            name="level"
            value={formData.level || "beginner"}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900 h-10"
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
            name="tags" // changed from skills -> tags to match entity 'tags'
            rows={2}
            value={formData.tags || ""}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirements (comma separated)
          </label>
          <textarea
            name="requirements" // changed from prerequisites -> requirements to match entity 'requirements'
            rows={2}
            value={formData.requirements || ""}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           Course for (comma separated)
          </label>
          <textarea
            name="learningOutcomes"
            rows={2}
            value={formData.learningOutcomes || ""} // matches entity
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#51356e] text-gray-900"
          />
        </div>
        {/* 'Course for' field removed per request */}
      </div>
    </>
  );
}
