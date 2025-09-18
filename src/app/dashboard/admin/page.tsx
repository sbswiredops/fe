'use client';

import React from 'react';
import { useLanguage } from '@/components/contexts/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/components/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminDashboard() {
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
    { title: 'Total Users', value: '12,543', change: '+12%', icon: '👥' },
    { title: 'Active Courses', value: '487', change: '+8%', icon: '📚' },
    { title: 'Live Classes Today', value: '23', change: '+3%', icon: '🎥' },
    { title: 'Revenue This Month', value: '$45,690', change: '+15%', icon: '💰' },
  ];

  const quickActions = [
    { title: 'Manage Users', description: 'Add, edit, or remove users', icon: '👥', action: () => {} },
    { title: 'Course Management', description: 'Oversee all courses and content', icon: '📚', action: () => {} },
    { title: 'Live Class Schedule', description: 'Manage live class schedules', icon: '📅', action: () => {} },
    { title: 'Payment Reports', description: 'View financial reports and analytics', icon: '📊', action: () => {} },
    { title: 'System Settings', description: 'Configure platform settings', icon: '⚙️', action: () => {} },
    { title: 'Support Tickets', description: 'Handle user support requests', icon: '🎧', action: () => {} },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('dashboard.admin.title')}
          </h1>
          <p className="text-gray-600">
            Welcome back, {displayName}! Here&apos;s what&apos;s happening on your platform today.
          </p>
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
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'user' },
              { action: 'Course published', user: 'Sarah Wilson', time: '1 hour ago', type: 'course' },
              { action: 'Live class completed', user: 'Mike Chen', time: '3 hours ago', type: 'class' },
              { action: 'Payment received', user: 'Ahmed Rahman', time: '5 hours ago', type: 'payment' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-green-500' :
                  activity.type === 'course' ? 'bg-blue-500' :
                  activity.type === 'class' ? 'bg-purple-500' :
                  'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    <span className="font-medium">{activity.action}</span>
                    {' '}by {activity.user}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
