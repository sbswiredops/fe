/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { Course } from "../types";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}</span>
    </div>
  );
}

export default function CourseCard({ course }: { course: Course }) {
  const { t } = useLanguage();
  const courseSlug = (course as any).sku ?? course.id;
  const instructor = (course as any)?.instructor;
  const avatarUrl = instructor?.avatar || null;

  return (
    <Link
      href={`/courses/${courseSlug}`}
      className="block group focus:outline-none touch-auto"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div
        className="w-full sm:w-[330px] bg-white rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
        style={{ touchAction: "pan-x pan-y" }}
      >
        {/* Thumbnail */}
        <div className="relative h-50 rounded-t-xl overflow-hidden bg-gray-50">
          {(course as any)?.thumbnail ? (
            <img
              src={(course as any).thumbnail}
              alt={course.title || "Course thumbnail"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 ${(course as any)?.thumbnail ? "hidden" : ""}`}
          >
            <svg
              className="w-16 h-16 text-blue-500 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col justify-between h-[280px]">
          <div>
            {/* Category */}
            <span className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
              {(course as any)?.category?.name || "Web Development"}
            </span>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700">
              {course.title}
            </h3>

            {/* Instructor */}
            <div className="flex items-center mb-3">
              {avatarUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-200">
                  <img
                    src={avatarUrl}
                    alt={instructor?.name || "Instructor"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 mr-3 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {instructor?.name
                    ? instructor.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "IN"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {instructor?.name || "Instructor"}
                </p>
              </div>
            </div>

            {/* Rating + Students */}
            <div className="flex items-center justify-between mb-3">
              <StarRating rating={Number(course.rating) || 0} />
              <span className="text-sm text-gray-500">
                {(course.enrollmentCount ?? 0).toLocaleString()}{" "}
                {t("featuredCourses.students")}
              </span>
            </div>
          </div>

          <hr className="my-1 border-gray-200" />

          {/* Price */}
          <div className="flex items-center justify-between">
            {(() => {
              const discountPrice = (course as any).discountPrice;
              const price = course.price;

              const hasDiscount =
                discountPrice != null &&
                price != null &&
                Number(discountPrice) > 0 &&
                Number(discountPrice) < Number(price);

              return (
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-blue-700">
                    ৳
                    {hasDiscount
                      ? Number(discountPrice).toFixed(0)
                      : Number(price).toFixed(0)}
                  </div>
                  {hasDiscount && (
                    <div className="text-sm line-through text-gray-400">
                      ৳{Number(price).toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </Link>
  );
}
