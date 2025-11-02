/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import CourseCard from "@/components/ui/CourseCard";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Course } from "@/components/types";
import { useSearchParams } from "next/navigation";
import { courseService } from "@/services/courseService";
import { categoryService } from "@/services/categoryService";

// Types for the three public-facing course groups
export enum CourseType {
  RECORDED = "Recorded",
  FREE_LIVE = "Free Live",
  UPCOMING_LIVE = "Upcoming Live",
  FEATURED = "Featured",
}

type CourseWithType = Course & { type: CourseType };

function normalizeType(input?: string | null): CourseType | "all" {
  if (!input) return "all";
  const v = decodeURIComponent(String(input)).toLowerCase();
  if (v.includes("recorded")) return CourseType.RECORDED;
  if (v.includes("free")) return CourseType.FREE_LIVE;
  if (v.includes("upcoming")) return CourseType.UPCOMING_LIVE;
  if (v.includes("live")) return CourseType.UPCOMING_LIVE;
  return "all";
}

function AllCoursesClient() {
  const { t, currentLanguage } = useLanguage();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedType, setSelectedType] = useState<CourseType | "all">(() =>
    normalizeType(searchParams.get("type"))
  );
  const [courses, setCourses] = useState<CourseWithType[]>([]);
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedType(normalizeType(searchParams.get("type")));
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    const mapApiCourseToUi = (c: any): CourseWithType => {
      const instructorName =
        c?.instructor?.name ||
        [c?.instructor?.firstName, c?.instructor?.lastName]
          .filter(Boolean)
          .join(" ") ||
        c?.instructorId ||
        "Instructor";
      const categoryName =
        c?.category?.name || (c as any)?.category || "General";
      const created = c?.createdAt ? new Date(c.createdAt) : new Date();
      const durationStr =
        typeof c?.totalDuration === "string" && c?.totalDuration
          ? c.totalDuration
          : typeof c?.duration === "number"
          ? `${c.duration} min`
          : String(c?.duration || "");
      const courseTypeRaw = (c?.courseType || "").toString().toLowerCase();
      let type: CourseType = CourseType.RECORDED;
      if (courseTypeRaw.includes("free")) type = CourseType.FREE_LIVE;
      else if (courseTypeRaw.includes("upcoming"))
        type = CourseType.UPCOMING_LIVE;
      else if (courseTypeRaw.includes("live")) type = CourseType.UPCOMING_LIVE;

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        instructor: instructorName,
        instructorId: c.instructorId || (c?.instructor?.id ?? ""),
        price: Number(c.price ?? 0),
        duration: durationStr || "",
        thumbnail: c.thumbnail || "/placeholder-course.jpg",
        category: categoryName,
        enrolledStudents: Number(c.enrollmentCount ?? 0),
        rating: Number(c.rating ?? 0),
        createdAt: created,
        type,
      } as CourseWithType;
    };

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const catRes = await categoryService.getActiveCategories({
          limit: 1000,
        });
        if (!ignore && catRes?.success && Array.isArray(catRes.data)) {
          const names = Array.from(new Set(catRes.data.map((c: any) => c.name)))
            .filter(Boolean)
            .sort();
          setCategoriesState(names as string[]);
        }
        if (selectedType === "all") {
          const res = await courseService.getPublishedCourses({ limit: 1000 });
          if (!ignore && res?.success && Array.isArray(res.data?.courses)) {
            setCourses(res.data.courses.map(mapApiCourseToUi));
          }
        } else {
          const res = await courseService.getCoursesByType(selectedType, {
            limit: 1000,
          });
          const list = (res?.data as any)?.courses || [];
          if (!ignore && res?.success && Array.isArray(list)) {
            setCourses(list.map(mapApiCourseToUi));
          }
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load courses");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
    // Only depend on selectedType, enum values are static
  }, [selectedType]);

  const categories = useMemo(() => categoriesState, [categoriesState]);

  const filtered = useMemo(() => {
    const result = courses.filter((c) => {
      const matchesType = selectedType === "all" || c.type === selectedType;
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(c.category);
      const matchesFree = !showFreeOnly || c.price === 0;
      return matchesType && matchesQuery && matchesCategory && matchesFree;
    });

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        result.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
    }

    return result;
  }, [query, selectedCategories, showFreeOnly, sortBy, selectedType, courses]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Update: Use CourseType enum for typeTabs
  enum CourseType {
    RECORDED = "Recorded",
    FREE_LIVE = "Free Live",
    UPCOMING_LIVE = "Upcoming Live",
    FEATURED = "Featured",
  }

  const typeTabs: {
    key: string;
    label: string;
    href: string;
  }[] = [
    {
      key: "all",
      label: currentLanguage.code === "bn" ? "সকল" : "All",
      href: "/courses",
    },
    {
      key: CourseType.RECORDED,
      label: currentLanguage.code === "bn" ? "রেকর্ডেড" : "Recorded Courses",
      href: `/courses?type=${encodeURIComponent(CourseType.RECORDED)}`,
    },
    {
      key: CourseType.FREE_LIVE,
      label: currentLanguage.code === "bn" ? "ফ্রি লাইভ" : "Free Live",
      href: `/courses?type=${encodeURIComponent(CourseType.FREE_LIVE)}`,
    },
    {
      key: CourseType.UPCOMING_LIVE,
      label: currentLanguage.code === "bn" ? "আপকামিং লাইভ" : "Upcoming Live",
      href: `/courses?type=${encodeURIComponent(CourseType.UPCOMING_LIVE)}`,
    },
  ];

  return (
    <>
      <div
        className="py-12 sm:py-16 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(81,53,110,0.95) 0%, rgba(142,103,182,0.9) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMTUiLz48L2c+PC9zdmc+')]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-2xl p-8 sm:p-10 text-center text-white">
            <h1 className="text-5xl  font-bold mb-4">
              {currentLanguage.code === "bn"
                ? "বাংলা অনলাইন কোর্স"
                : t("nav.courses")}
            </h1>
            <p className="text-lg opacity-95 max-w-2xl mx-auto">
              {currentLanguage.code === "bn"
                ? "আপনার পছন্দের ক্যারিয়ার স্কিল শিখে নিন এবং দক্ষতা বাড়িয়ে ক্যারিয়ারে এগিয়ে যান।"
                : "Browse top courses from expert instructors and advance your career."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 bg-gray-50 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                {currentLanguage.code === "bn" ? "ফিল্টার" : "Filters"}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {currentLanguage.code === "bn" ? "খুঁজুন" : "Search"}
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51356e] focus:border-transparent"
                    placeholder={
                      currentLanguage.code === "bn"
                        ? "ক���র্স খুঁজুন"
                        : "Search courses"
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {currentLanguage.code === "bn" ? "ক্যাটাগরি" : "Categories"}
                </h3>
                <div className="space-y-3 max-h-64 overflow-auto pr-1 custom-scrollbar">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#51356e] focus:ring-[#51356e]"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {currentLanguage.code === "bn" ? "মূল্য" : "Price"}
                </h3>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#51356e] focus:ring-[#51356e]"
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">
                    {currentLanguage.code === "bn"
                      ? "শুধুমাত্র ফ্র�� কোর্স"
                      : "Free courses only"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  className="text-sm text-gray-600 hover:text-[#51356e] transition-colors font-medium"
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowFreeOnly(false);
                    setQuery("");
                    setSortBy("popularity");
                  }}
                >
                  {currentLanguage.code === "bn"
                    ? "সব ফিল্টার রিসেট"
                    : "Reset all filters"}
                </button>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {typeTabs.map((tab) => (
                <Link key={tab.key} href={tab.href}>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedType === tab.key
                        ? "bg-[#51356e] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <p className="text-gray-600 mb-4 sm:mb-0">
                {filtered.length}{" "}
                {currentLanguage.code === "bn"
                  ? "টি কোর্স পাওয়া গেছে"
                  : "courses found"}
              </p>

              <div className="flex items-center">
                <label className="text-sm text-gray-700 mr-2 whitespace-nowrap">
                  {currentLanguage.code === "bn" ? "সাজান:" : "Sort by:"}
                </label>
                <select
                  className="border text-gray-700 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#51356e]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">
                    {currentLanguage.code === "bn"
                      ? "জনপ্রিয়তা"
                      : "Popularity"}
                  </option>
                  <option value="rating">
                    {currentLanguage.code === "bn" ? "রেটিং" : "Highest Rated"}
                  </option>
                  <option value="newest">
                    {currentLanguage.code === "bn" ? "নতুন" : "Newest"}
                  </option>
                  <option value="price-low">
                    {currentLanguage.code === "bn"
                      ? "মূল্য: কম থেকে বেশি"
                      : "Price: Low to High"}
                  </option>
                  <option value="price-high">
                    {currentLanguage.code === "bn"
                      ? "মূল্য: বেশি থেকে কম"
                      : "Price: High to Low"}
                  </option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <p className="text-gray-500">Loading courses...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {error ||
                    (currentLanguage.code === "bn"
                      ? "কোন কোর্স পাওয়া যায়নি"
                      : "No courses found")}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {currentLanguage.code === "bn"
                    ? "আপনার অনুসন্ধানের সাথে মিলে এমন কোন কোর্স পাওয়া যায়নি। অনুগ্রহ করে বিভিন্ন ফিল্টার চেষ্টা করুন।"
                    : "No courses match your search criteria. Please try different filters."}
                </p>
                <button
                  className="text-sm text-[#51356e] hover:text-[#3f2957] font-medium underline"
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowFreeOnly(false);
                    setQuery("");
                  }}
                >
                  {currentLanguage.code === "bn"
                    ? "সব ফিল্টার সাফ করুন"
                    : "Clear all filters"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
}

export default function AllCoursesPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={<div className="py-32 text-center text-lg">লোড হচ্ছে...</div>}
      >
        <AllCoursesClient />
      </Suspense>
    </MainLayout>
  );
}
