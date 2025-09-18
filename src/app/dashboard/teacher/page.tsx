'use client';

import React from 'react';

import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/contexts/AuthContext';
import { useLanguage } from '@/components/contexts/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

function TeacherDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const displayName = (() => {
    const u: any = user as any;
    const primary = typeof u?.name === 'string' && u.name.trim() ? u.name.trim() : '';
    const secondary = typeof u?.email === 'string' && u.email.trim() ? u.email.trim() : '';
    const roleStr = typeof u?.role === 'string' ? u.role : (typeof u?.role?.name === 'string' ? u.role.name : '');
    return primary || secondary || roleStr || 'User';
  })();

  const stats = [
    { title: 'My Courses', value: '12', change: '+2 this month', icon: '📚' },
    { title: 'Total Students', value: '1,234', change: '+45 this week', icon: '🎓' },
    { title: 'Live Classes', value: '8', change: '3 scheduled today', icon: '🎥' },
    { title: 'Earnings', value: '$2,890', change: '+$450 this month', icon: '💰' },
  ];

  const upcomingClasses = [
    { title: 'Advanced React Patterns', time: '2:00 PM', students: 23, duration: '90 min' },
    { title: 'JavaScript Fundamentals', time: '4:30 PM', students: 45, duration: '60 min' },
    { title: 'Node.js Best Practices', time: '7:00 PM', students: 32, duration: '120 min' },
  ];

  const recentCourses = [
    { title: 'Full Stack Web Development', students: 156, rating: 4.8, status: 'Active' },
    { title: 'React Masterclass', students: 89, rating: 4.9, status: 'Active' },
    { title: 'JavaScript Essentials', students: 234, rating: 4.7, status: 'Active' },
    { title: 'Node.js Complete Guide', students: 67, rating: 4.6, status: 'Draft' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('dashboard.teacher.title')}
              </h1>
              <p className="text-gray-600">
                Welcome back, {displayName}! Manage your courses and connect with your students.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">Create Course</Button>
              <Button>Schedule Live Class</Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-blue-600 mt-1">{stat.change}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Live Classes */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Today's Live Classes</h2>
              <Button size="sm" variant="outline">View All</Button>
            </div>
            <div className="space-y-4">
              {upcomingClasses.map((classItem, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                    <span className="text-sm text-blue-600 font-medium">{classItem.time}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👥 {classItem.students} students</span>
                    <span>⏱️ {classItem.duration}</span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm">Start Class</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <Button size="sm" variant="outline">Manage All</Button>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>��� {course.students} students</span>
                    <span>⭐ {course.rating}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">View Analytics</Button>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Create Course', icon: '➕', description: 'Start a new course' },
              { title: 'Schedule Class', icon: '📅', description: 'Plan a live session' },
              { title: 'Student Messages', icon: '💬', description: 'Check your inbox' },
              { title: 'Analytics', icon: '📊', description: 'View performance data' },
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <TeacherDashboard />
    </ProtectedRoute>
  );
}
