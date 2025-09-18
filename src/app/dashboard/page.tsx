'use client';

import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/';
        return;
      }

      const roleValue = typeof (user as any).role === 'string' ? (user as any).role : String((user as any).role?.name || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
      if (roleValue && ADMIN_ROLES.includes(roleValue)) {
        router.push('/dashboard/admin');
      } else if (roleValue && TEACHER_ROLES.includes(roleValue)) {
        router.push('/dashboard/teacher');
      } else if (roleValue === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Redirecting...</h2>
        <p className="text-gray-600">Please wait while we redirect you to your dashboard.</p>
      </div>
    </div>
  );
}
