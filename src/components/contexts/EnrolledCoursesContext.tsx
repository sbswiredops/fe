"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export type EnrolledCourse = any; // Backend defines shape; keep flexible here

interface EnrolledCoursesState {
  courses: EnrolledCourse[];
  setCourses: (list: EnrolledCourse[]) => void;
  getById: (id: string) => EnrolledCourse | undefined;
  lastSelectedCourseId: string | null;
  setLastSelectedCourseId: (id: string | null) => void;
}

const EnrolledCoursesContext = createContext<EnrolledCoursesState | undefined>(undefined);

export function EnrolledCoursesProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [lastSelectedCourseId, setLastSelectedCourseId] = useState<string | null>(null);

  const value = useMemo<EnrolledCoursesState>(() => ({
    courses,
    setCourses,
    getById: (id: string) => courses.find((c: any) => String(c?.id) === String(id)),
    lastSelectedCourseId,
    setLastSelectedCourseId,
  }), [courses, lastSelectedCourseId]);

  return (
    <EnrolledCoursesContext.Provider value={value}>{children}</EnrolledCoursesContext.Provider>
  );
}

export function useEnrolledCourses() {
  const ctx = useContext(EnrolledCoursesContext);
  if (!ctx) throw new Error("useEnrolledCourses must be used within EnrolledCoursesProvider");
  return ctx;
}
