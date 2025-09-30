'use client';

import React, { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/contexts/AuthContext';

const ADMIN_ROLES = [
  'admin',
  'super_admin',
  'sales_marketing',
  'finance_accountant',
  'content_creator',
];

const TEACHER_ROLES = [
  'teacher',
  'instructor',
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useLayoutEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    const roleValue = typeof (user as any).role === 'string' ? (user as any).role : String((user as any).role?.name || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (roleValue && ADMIN_ROLES.includes(roleValue)) {
      router.replace('/dashboard/admin');
    } else if (roleValue && TEACHER_ROLES.includes(roleValue)) {
      router.replace('/dashboard/teacher');
    } else if (roleValue === 'student') {
      router.replace('/dashboard/student');
    } else {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return null;
}
