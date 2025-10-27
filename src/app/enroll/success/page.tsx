"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
export const runtime = 'edge';
export default function EnrollSuccessPage({
  searchParams,
}: {
  searchParams?: { courseId?: string };
}) {
  const courseId = searchParams?.courseId ?? "";

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enrollment successful!
          </h1>
          <p className="text-gray-600 mt-2">
            You’re now enrolled. Start learning right away.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {courseId ? (
              <Link href={`/dashboard/student/learn/${courseId}`}>
                <Button
                  className="w-full btn-hover text-white"
                  style={{
                    backgroundColor: "var(--color-text-primary)",
                    borderColor: "var(--color-text-primary)",
                  }}
                >
                  Continue to course
                </Button>
              </Link>
            ) : null}
            <Link href="/courses">
              <Button variant="outline" className="w-full">
                Browse more courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
