'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  parameters?: string[];
  response?: string;
  authentication?: boolean;
  roles?: string[];
}

interface APISection {
  title: string;
  description: string;
  endpoints: APIEndpoint[];
}

export default function APIDocumentation() {
  const [activeSection, setActiveSection] = useState<string>('authentication');

  const apiSections: APISection[] = [
    {
      title: 'Authentication',
      description: 'User authentication and account management endpoints',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/auth/register',
          description: 'Register a new user account with email verification',
          parameters: ['name', 'email', 'password', 'role'],
          response: '{ "success": true, "message": "OTP sent to email" }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/auth/verify-otp',
          description: 'Verify email address with OTP code',
          parameters: ['email', 'otp'],
          response: '{ "success": true, "user": {...}, "token": "jwt_token" }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/auth/login',
          description: 'Login with email and password',
          parameters: ['email', 'password'],
          response: '{ "success": true, "user": {...}, "token": "jwt_token" }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/auth/logout',
          description: 'Logout current user session',
          response: '{ "success": true, "message": "Logged out successfully" }',
          authentication: true
        },
        {
          method: 'POST',
          endpoint: '/api/auth/forgot-password',
          description: 'Request password reset with email',
          parameters: ['email'],
          response: '{ "success": true, "message": "Reset OTP sent" }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/auth/reset-password',
          description: 'Reset password with OTP verification',
          parameters: ['email', 'otp', 'newPassword'],
          response: '{ "success": true, "message": "Password reset successfully" }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/auth/resend-otp',
          description: 'Resend OTP for email verification',
          parameters: ['email', 'type'],
          response: '{ "success": true, "message": "OTP resent" }',
          authentication: false
        },
        {
          method: 'GET',
          endpoint: '/api/auth/me',
          description: 'Get current authenticated user information',
          response: '{ "success": true, "user": {...} }',
          authentication: true
        }
      ]
    },
    {
      title: 'Courses',
      description: 'Course management and enrollment endpoints',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/courses',
          description: 'Get list of all courses with filtering and pagination',
          parameters: ['page', 'limit', 'category', 'level', 'search'],
          response: '{ "courses": [...], "total": 100, "page": 1 }',
          authentication: false
        },
        {
          method: 'GET',
          endpoint: '/api/courses/featured',
          description: 'Get featured courses for homepage',
          response: '{ "courses": [...] }',
          authentication: false
        },
        {
          method: 'GET',
          endpoint: '/api/courses/{id}',
          description: 'Get detailed information about a specific course',
          parameters: ['id'],
          response: '{ "course": {...}, "instructor": {...}, "curriculum": [...] }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/courses',
          description: 'Create a new course',
          parameters: ['title', 'description', 'price', 'category', 'level'],
          response: '{ "success": true, "course": {...} }',
          authentication: true,
          roles: ['teacher', 'admin']
        },
        {
          method: 'PUT',
          endpoint: '/api/courses/{id}',
          description: 'Update course information',
          parameters: ['id', 'title', 'description', 'price'],
          response: '{ "success": true, "course": {...} }',
          authentication: true,
          roles: ['teacher', 'admin']
        },
        {
          method: 'DELETE',
          endpoint: '/api/courses/{id}',
          description: 'Delete a course',
          parameters: ['id'],
          response: '{ "success": true, "message": "Course deleted" }',
          authentication: true,
          roles: ['admin']
        },
        {
          method: 'POST',
          endpoint: '/api/courses/{id}/enroll',
          description: 'Enroll student in a course',
          parameters: ['id', 'paymentMethod'],
          response: '{ "success": true, "enrollment": {...} }',
          authentication: true,
          roles: ['student']
        },
        {
          method: 'GET',
          endpoint: '/api/courses/{id}/progress',
          description: 'Get user progress in a course',
          parameters: ['id'],
          response: '{ "progress": 75, "completedLessons": [...] }',
          authentication: true
        }
      ]
    },
    {
      title: 'Live Classes',
      description: 'Live class scheduling and management endpoints',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/live-classes',
          description: 'Get list of upcoming live classes',
          parameters: ['page', 'limit', 'date', 'instructor'],
          response: '{ "liveClasses": [...], "total": 50 }',
          authentication: false
        },
        {
          method: 'GET',
          endpoint: '/api/live-classes/{id}',
          description: 'Get detailed information about a live class',
          parameters: ['id'],
          response: '{ "liveClass": {...}, "instructor": {...} }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/live-classes',
          description: 'Schedule a new live class',
          parameters: ['title', 'description', 'scheduledAt', 'duration'],
          response: '{ "success": true, "liveClass": {...} }',
          authentication: true,
          roles: ['teacher', 'admin']
        },
        {
          method: 'POST',
          endpoint: '/api/live-classes/{id}/join',
          description: 'Join a live class session',
          parameters: ['id'],
          response: '{ "success": true, "meetingLink": "..." }',
          authentication: true
        },
        {
          method: 'GET',
          endpoint: '/api/live-classes/{id}/participants',
          description: 'Get list of participants in a live class',
          parameters: ['id'],
          response: '{ "participants": [...], "count": 25 }',
          authentication: true,
          roles: ['teacher', 'admin']
        }
      ]
    },
    {
      title: 'User Dashboard',
      description: 'User dashboard data and statistics endpoints',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/dashboard/stats',
          description: 'Get user dashboard statistics',
          response: '{ "enrolledCourses": 5, "completedCourses": 2, "totalHours": 120 }',
          authentication: true
        },
        {
          method: 'GET',
          endpoint: '/api/dashboard/enrolled-courses',
          description: 'Get user\'s enrolled courses with progress',
          response: '{ "courses": [...] }',
          authentication: true
        },
        {
          method: 'GET',
          endpoint: '/api/dashboard/live-classes',
          description: 'Get user\'s upcoming live classes',
          response: '{ "liveClasses": [...] }',
          authentication: true
        },
        {
          method: 'GET',
          endpoint: '/api/dashboard/certificates',
          description: 'Get user\'s earned certificates',
          response: '{ "certificates": [...] }',
          authentication: true
        }
      ]
    },
    {
      title: 'User Profile',
      description: 'User profile management endpoints',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/profile',
          description: 'Get user profile information',
          response: '{ "user": {...} }',
          authentication: true
        },
        {
          method: 'PUT',
          endpoint: '/api/profile',
          description: 'Update user profile information',
          parameters: ['name', 'bio', 'phone', 'location'],
          response: '{ "success": true, "user": {...} }',
          authentication: true
        },
        {
          method: 'POST',
          endpoint: '/api/profile/avatar',
          description: 'Upload user profile picture',
          parameters: ['file'],
          response: '{ "success": true, "avatarUrl": "..." }',
          authentication: true
        },
        {
          method: 'PUT',
          endpoint: '/api/profile/password',
          description: 'Change user password',
          parameters: ['currentPassword', 'newPassword'],
          response: '{ "success": true, "message": "Password updated" }',
          authentication: true
        }
      ]
    },
    {
      title: 'Payments',
      description: 'Payment processing and transaction endpoints',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/payments/intent',
          description: 'Create payment intent for course enrollment',
          parameters: ['courseId', 'amount', 'currency'],
          response: '{ "success": true, "clientSecret": "..." }',
          authentication: true
        },
        {
          method: 'POST',
          endpoint: '/api/payments/confirm',
          description: 'Confirm payment and complete enrollment',
          parameters: ['paymentIntentId', 'courseId'],
          response: '{ "success": true, "enrollment": {...} }',
          authentication: true
        },
        {
          method: 'GET',
          endpoint: '/api/payments/history',
          description: 'Get user payment history',
          parameters: ['page', 'limit'],
          response: '{ "payments": [...], "total": 10 }',
          authentication: true
        }
      ]
    },
    {
      title: 'Admin Panel',
      description: 'Administrative endpoints for platform management',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/admin/users',
          description: 'Get list of all users with filtering',
          parameters: ['page', 'limit', 'role', 'search'],
          response: '{ "users": [...], "total": 1000 }',
          authentication: true,
          roles: ['admin']
        },
        {
          method: 'PUT',
          endpoint: '/api/admin/users/{id}/role',
          description: 'Change user role',
          parameters: ['id', 'role'],
          response: '{ "success": true, "user": {...} }',
          authentication: true,
          roles: ['admin']
        },
        {
          method: 'GET',
          endpoint: '/api/admin/analytics',
          description: 'Get platform analytics and statistics',
          response: '{ "totalUsers": 10000, "totalCourses": 500, "revenue": 50000 }',
          authentication: true,
          roles: ['admin']
        },
        {
          method: 'GET',
          endpoint: '/api/admin/payments',
          description: 'Get payment reports and analytics',
          parameters: ['startDate', 'endDate', 'page', 'limit'],
          response: '{ "payments": [...], "totalRevenue": 50000 }',
          authentication: true,
          roles: ['admin']
        }
      ]
    },
    {
      title: 'Content & Utility',
      description: 'General content and utility endpoints',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/testimonials',
          description: 'Get user testimonials and reviews',
          parameters: ['page', 'limit'],
          response: '{ "testimonials": [...] }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/testimonials',
          description: 'Submit a new testimonial',
          parameters: ['courseId', 'rating', 'comment'],
          response: '{ "success": true, "testimonial": {...} }',
          authentication: true
        },
        {
          method: 'GET',
          endpoint: '/api/categories',
          description: 'Get list of course categories',
          response: '{ "categories": [...] }',
          authentication: false
        },
        {
          method: 'GET',
          endpoint: '/api/instructors',
          description: 'Get list of instructors',
          parameters: ['page', 'limit'],
          response: '{ "instructors": [...] }',
          authentication: false
        },
        {
          method: 'POST',
          endpoint: '/api/contact',
          description: 'Submit contact form',
          parameters: ['name', 'email', 'subject', 'message'],
          response: '{ "success": true, "message": "Message sent" }',
          authentication: false
        },
        {
          method: 'GET',
          endpoint: '/api/search',
          description: 'Global search across courses and live classes',
          parameters: ['q', 'type', 'page', 'limit'],
          response: '{ "results": [...], "total": 25 }',
          authentication: false
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Shekhabo API Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive API documentation for the Shekhabo learning platform. 
              Build powerful integrations with our RESTful API endpoints.
            </p>
          </div>

          {/* Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {apiSections.map((section) => {
                  const sectionId = section.title.toLowerCase().replace(' ', '-');
                  return (
                    <button
                      key={sectionId}
                      onClick={() => setActiveSection(sectionId)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSection === sectionId
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <nav className="space-y-2">
                  {apiSections.map((section) => {
                    const sectionId = section.title.toLowerCase().replace(' ', '-');
                    return (
                      <button
                        key={sectionId}
                        onClick={() => setActiveSection(sectionId)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeSection === sectionId
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {section.title}
                      </button>
                    );
                  })}
                </nav>

                {/* Base URL Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Base URL</h4>
                  <code className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                    https://api.shekhabo.com
                  </code>
                </div>

                {/* Authentication Info */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Authentication</h4>
                  <p className="text-sm text-blue-700">
                    Include JWT token in Authorization header:
                  </p>
                  <code className="text-xs text-blue-600 bg-white px-2 py-1 rounded mt-2 block">
                    Bearer your_jwt_token
                  </code>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {apiSections.map((section) => {
                const sectionId = section.title.toLowerCase().replace(' ', '-');
                if (activeSection !== sectionId) return null;

                return (
                  <div key={sectionId} className="space-y-6">
                    {/* Section Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                      <p className="text-gray-600">{section.description}</p>
                    </div>

                    {/* Endpoints */}
                    {section.endpoints.map((endpoint, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* Method and Endpoint */}
                        <div className="flex items-center space-x-4 mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-lg font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4">{endpoint.description}</p>

                        {/* Authentication & Roles */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {endpoint.authentication && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              🔒 Authentication Required
                            </span>
                          )}
                          {endpoint.roles && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              👤 Roles: {endpoint.roles.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Parameters */}
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Parameters</h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <ul className="space-y-1">
                                {endpoint.parameters.map((param, paramIndex) => (
                                  <li key={paramIndex} className="text-sm">
                                    <code className="text-blue-600 font-mono">{param}</code>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Response */}
                        {endpoint.response && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Example Response</h4>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-green-400 text-sm font-mono">
                                {endpoint.response}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 mb-4">
                If you have questions about our API or need assistance with integration, 
                please don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:api@shekhabo.com"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Email API Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
