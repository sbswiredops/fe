'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  redirectTo?: string;
}

const ADMIN_ROLES = ['admin', 'super_admin', 'sales_marketing', 'finance_accountant', 'content_creator'];
const TEACHER_ROLES = ['teacher', 'instructor'];

const normalizeRole = (role: any) =>
  String(typeof role === 'string' ? role : role?.name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const getRoleGroup = (role: any): 'admin' | 'teacher' | 'student' | 'other' => {
  const r = normalizeRole(role);
  if (!r) return 'other';
  if (ADMIN_ROLES.includes(r)) return 'admin';
  if (TEACHER_ROLES.includes(r)) return 'teacher';
  if (r === 'student') return 'student';
  return 'other';
};

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    const group = getRoleGroup(user.role);
    if (allowedRoles && !allowedRoles.includes(group as 'admin' | 'teacher' | 'student')) {
      router.replace('/dashboard');
      return;
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect চলার সময় ফ্ল্যাশ এড়াতে
  const group = getRoleGroup(user?.role);
  if (!user || (allowedRoles && !allowedRoles.includes(group as 'admin' | 'teacher' | 'student'))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Redirecting...</h2>
          <p className="text-gray-600">Please wait while we redirect you.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}