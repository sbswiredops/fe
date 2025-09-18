"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
// import Button from "@/components/ui/Button";
// import Link from "next/link";
import { UserService } from "@/services/userService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useEnrolledCourses } from "@/components/contexts/EnrolledCoursesContext";
import { Course } from "@/types/api";

// ... keep your existing interfaces (Lesson, Section, Recommendation, Course) ...
export const runtime = 'edge';


const userService = new UserService();

function Player({ course }: { course: Course }) {
  // TODO: Replace this with your actual Player UI implementation
  return (
    <div>
      <h2>{course.title}</h2>
      {/* Render course details, sections, recommendations, etc. */}
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { getById } = useEnrolledCourses();
  const userId = user?.id;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) Try to resolve from context for instant navigate (no API)
  useEffect(() => {
    const local = getById(String(id)) as any;
    if (local) {
      setCourse({
        ...local,
        sections: local.sections || [],
        recommendations: local.recommendations || [],
      });
      setLoading(false);
    }
  }, [id, getById]);

  // 2) Fallback: if context empty (e.g., hard refresh), fetch once from enrolled list
  useEffect(() => {
    if (!userId) return;
    if (course) return; // already set from context
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const response = await userService.getEnrolledCourses(userId!);
        const found = response.data?.courses?.find(
          (c: any) => String(c.id) === String(id)
        );
        if (!ignore && found) {
          setCourse({
            ...found,
            sections: found.sections || [],
            recommendations: found.recommendations || [],
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id, userId, course]);

  // 3) Fetch continue learning payload once (used for progress/UI enrichment)
  useEffect(() => {
    if (!userId) return;
    userService.getContinueLearning(userId).catch(() => void 0);
  }, [userId]);

  if (loading) return <div>লোড হচ্ছে...</div>;
  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-600 text-xl font-bold">
          কোর্সটি খুঁজে পাওয়া যায়নি。
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <Player course={course} />
    </ProtectedRoute>
  );
}