'use client';

import React, { useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import authService from '@/services/authService';

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

  const effectiveUser = useMemo(() => user || authService.getCurrentUserFromStorage<any>() || null, [user]);

  useLayoutEffect(() => {
    if (isLoading) return;

    if (!effectiveUser) {
      router.replace(redirectTo);
      return;
    }

    const group = getRoleGroup(effectiveUser.role);
    if (allowedRoles && !allowedRoles.includes(group as 'admin' | 'teacher' | 'student')) {
      router.replace('/dashboard');
      return;
    }
  }, [effectiveUser, isLoading, allowedRoles, redirectTo, router]);

  // If we have a user (from context or storage), optimistically render children
  if (effectiveUser) {
    const group = getRoleGroup(effectiveUser.role);
    if (allowedRoles && !allowedRoles.includes(group as 'admin' | 'teacher' | 'student')) {
      return null;
    }
    return <>{children}</>;
  }

  // No user yet; render nothing while redirecting
  return null;
}
