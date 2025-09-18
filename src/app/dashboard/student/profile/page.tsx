/* eslint-disable @next/next/no-img-element */
'use client';

import { useAuth } from '@/components/contexts/AuthContext';
import { useLanguage } from '@/components/contexts/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import React from 'react';


export default function StudentProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const displayName = (() => {
    const u: any = user as any;
    const primary = typeof u?.name === 'string' && u.name.trim() ? u.name.trim() : '';
    const secondary = typeof u?.email === 'string' && u.email.trim() ? u.email.trim() : '';
    const roleStr = typeof u?.role === 'string' ? u.role : (typeof u?.role?.name === 'string' ? u.role.name : '');
    return primary || secondary || roleStr || 'User';
  })();

  // Example enrolled courses and achievements (replace with real data)
  const enrolledCourses = [
    { title: 'Full Stack Web Development', progress: 75 },
    { title: 'Digital Marketing Mastery', progress: 100 },
    { title: 'UI/UX Design Fundamentals', progress: 40 },
  ];

  const achievements = [
    { title: 'Course Completion', description: 'Completed Digital Marketing Mastery', icon: '🎉' },
    { title: 'Perfect Attendance', description: 'Attended 10 consecutive live classes', icon: '⭐' },
    { title: 'Top Performer', description: 'Scored 95% in Web Development Quiz', icon: '🏆' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-8">
          <img
            src={user?.profileImage || '/placeholder-avatar.jpg'}
            alt={displayName || 'User'}
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {t('dashboard.student.title')}
            </span>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.student.enrolledCourses')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow border">
                <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{course.progress}% {t('dashboard.student.progress')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.student.certificates')}</h2>
          <div className="space-y-3">
            {achievements.map((ach, idx) => (
              <div key={idx} className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow border">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{ach.title}</h3>
                  <p className="text-xs text-gray-500">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
