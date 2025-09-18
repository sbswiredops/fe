import Link from "next/link";
import Button from "@/components/ui/Button";
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

  return (
    <div className="flex-shrink-0 w-full sm:w-[330px] bg-white rounded-xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:z-30 relative will-change-transform">
      {/* Course Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center rounded-t-xl overflow-hidden">
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

      {/* Course Content */}
      <div className="p-5 flex flex-col justify-between h-[340px]">
        <div>
          {/* Category Badge */}
          <span className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
            {course.category || "Web Development"}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {course.description}
          </p>
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {typeof (course as any)?.instructor === "string"
                  ? (course as any).instructor
                  : (course as any)?.instructor?.name ||
                    (course as any)?.instructorId ||
                    "Instructor"}
              </p>
              <p className="text-xs text-gray-500">{course.duration}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <StarRating rating={course.rating} />
            <span className="text-sm text-gray-500">
              {course.enrolledStudents.toLocaleString()}{" "}
              {t("featuredCourses.students")}
            </span>
          </div>
        </div>
        {/* Divider */}
        <hr className="my-3 border-gray-200" />
        <div className="flex items-center justify-between mt-2">
          <div className="text-2xl font-bold text-blue-700">
            ৳{course.price}
          </div>
          <div className="flex gap-2">
            <Link href={`/courses/${course.id}`}>
              <Button
                variant="outline"
                size="lg"
                className="btn-hover w-full sm:w-auto rounded-lg px-4 py-2 font-medium"
                style={{
                  borderColor: "var(--color-text-primary)",
                  color: "var(--color-text-primary)",
                  backgroundColor: "rgba(80, 53, 110, 0.05)",
                  transition: "background 0.2s, color 0.2s",
                  minWidth: "0",
                  maxWidth: "100%",
                  height: "40px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-text-primary)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(80, 53, 110, 0.05)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
              >
                Details
              </Button>
            </Link>
            <Link href={`/courses/${course.id}/enroll`}>
              <Button
                size="sm"
                className="bg-[#4B256D] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#3a1e56] transition"
                style={{ height: "40px" }}
              >
                {t("featuredCourses.enroll") || "Enroll Now"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
