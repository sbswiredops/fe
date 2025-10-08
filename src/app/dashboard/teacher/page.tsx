"use client";

import React from "react";

import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/contexts/AuthContext";
import { useLanguage } from "@/components/contexts/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Lucide icons
import {
  BookOpen,
  Users,
  Video,
  DollarSign,
  Plus,
  Calendar,
  MessageCircle,
  BarChart2,
  Star,
} from "lucide-react";

function TeacherDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const displayName = (() => {
    const u: any = user as any;
    const primary =
      typeof u?.name === "string" && u.name.trim() ? u.name.trim() : "";
    const secondary =
      typeof u?.email === "string" && u.email.trim() ? u.email.trim() : "";
    const roleStr =
      typeof u?.role === "string"
        ? u.role
        : typeof u?.role?.name === "string"
        ? u.role.name
        : "";
    return primary || secondary || roleStr || "User";
  })();

  const stats = [
    {
      title: "My Courses",
      value: "12",
      change: "+2 this month",
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Total Students",
      value: "1,234",
      change: "+45 this week",
      icon: <Users className="w-8 h-8 text-green-500" />,
    },
    {
      title: "Live Classes",
      value: "8",
      change: "3 scheduled today",
      icon: <Video className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Earnings",
      value: "$2,890",
      change: "+$450 this month",
      icon: <DollarSign className="w-8 h-8 text-yellow-500" />,
    },
  ];

  const upcomingClasses = [
    {
      title: "Advanced React Patterns",
      time: "2:00 PM",
      students: 23,
      duration: "90 min",
    },
    {
      title: "JavaScript Fundamentals",
      time: "4:30 PM",
      students: 45,
      duration: "60 min",
    },
    {
      title: "Node.js Best Practices",
      time: "7:00 PM",
      students: 32,
      duration: "120 min",
    },
  ];

  const recentCourses = [
    {
      title: "Full Stack Web Development",
      students: 156,
      rating: 4.8,
      status: "Active",
    },
    { title: "React Masterclass", students: 89, rating: 4.9, status: "Active" },
    {
      title: "JavaScript Essentials",
      students: 234,
      rating: 4.7,
      status: "Active",
    },
    {
      title: "Node.js Complete Guide",
      students: 67,
      rating: 4.6,
      status: "Draft",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("dashboard.teacher.title")}
              </h1>
              <p className="text-gray-600">
                Welcome back, {displayName}! Manage your courses and connect
                with your students.
              </p>
            </div>
            {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Create Course
              </Button>
              <Button className="w-full sm:w-auto">Schedule Live Class</Button>
            </div> */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <style>{`
    @keyframes blueGradientMove {
      0% {background-position:0% 50%}
      50% {background-position:100% 50%}
      100% {background-position:0% 50%}
    }
    .animate-blue-gradient {
      animation: blueGradientMove 8s ease infinite;
    }
    @keyframes greenGradientMove {
      0% {background-position:0% 50%}
      50% {background-position:100% 50%}
      100% {background-position:0% 50%}
    }
    .animate-green-gradient {
      animation: greenGradientMove 8s ease infinite;
    }
    @keyframes purpleGradientMove {
      0% {background-position:0% 50%}
      50% {background-position:100% 50%}
      100% {background-position:0% 50%}
    }
    .animate-purple-gradient {
      animation: purpleGradientMove 8s ease infinite;
    }
    @keyframes yellowGradientMove {
      0% {background-position:0% 50%}
      50% {background-position:100% 50%}
      100% {background-position:0% 50%}
    }
    .animate-yellow-gradient {
      animation: yellowGradientMove 8s ease infinite;
    }
  `}</style>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-blue-gradient"
            style={{
              background:
                "linear-gradient(270deg, #2193b0, #6dd5ed, #1e3c72, #2980b9, #2193b0)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  My Courses
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  12
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  +2 this month
                </p>
              </div>
              <div className="text-3xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-green-gradient"
            style={{
              background:
                "linear-gradient(270deg, #43e97b, #66bb6a, #b2ff59, #00ff99, #00e676, #388e3c, #43e97b)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Total Students
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  1,234
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  +45 this week
                </p>
              </div>
              <div className="text-3xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-purple-gradient"
            style={{
              background:
                "linear-gradient(270deg, #a4508b, #5f0a87, #c471f5, #833ab4, #e040fb, #8e24aa, #a4508b)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Live Classes
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  8
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  3 scheduled today
                </p>
              </div>
              <div className="text-3xl">
                <Video className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div
            className="rounded-lg p-6 shadow-lg border border-gray-200 card-shadow-hover animate-yellow-gradient"
            style={{
              background:
                "linear-gradient(270deg, #f7971e, #ffd200, #f7971e, #ffd200, #f7971e)",
              backgroundSize: "800% 800%",
              color: "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#fff" }}>
                  Earnings
                </p>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  $2,890
                </p>
                <p className="text-sm mt-1" style={{ color: "#fff" }}>
                  +$450 this month
                </p>
              </div>
              <div className="text-3xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Announcements (replaces Live Classes) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Announcements
              </h2>
              <Button size="sm" variant="need">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">
                  Platform Update
                </h3>
                <p className="text-sm text-gray-600">
                  New features have been added to the dashboard. Check them out!
                </p>
                <span className="text-xs text-gray-400 mt-2 block">
                  2 hours ago
                </span>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">
                  Maintenance Notice
                </h3>
                <p className="text-sm text-gray-600">
                  Scheduled maintenance on Friday, 10:00 PM - 12:00 AM.
                </p>
                <span className="text-xs text-gray-400 mt-2 block">
                  1 day ago
                </span>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                My Courses
              </h2>
              <Button size="sm" variant="need">
                Manage All
              </Button>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      {course.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>
                      <Users className="inline w-4 h-4 mr-1" />{" "}
                      {course.students} students
                    </span>
                    <span>
                      <Star className="inline w-4 h-4 mr-1" /> {course.rating}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="need">
                      View Analytics
                    </Button>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherDashboard />
    </ProtectedRoute>
  );
}
