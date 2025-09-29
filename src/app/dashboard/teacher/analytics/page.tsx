"use client";

import React, { useMemo } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

type LineChartProps = {
  data: number[];
  labels?: string[];
  height?: number;
  stroke?: string;
  fill?: string;
};

function LineChart({
  data,
  labels = [],
  height = 180,
  stroke = "#51356e",
  fill = "rgba(142, 103, 182, 0.18)",
}: LineChartProps) {
  const width = 600; // SVG internal width; container controls responsiveness
  const padding = 24;

  const { pathD, areaD, points, maxY } = useMemo(() => {
    const maxVal = Math.max(1, ...data);
    const minVal = Math.min(0, ...data);
    const range = Math.max(1, maxVal - minVal);
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const step = innerW / Math.max(1, data.length - 1);
    const pts = data.map((v, i) => {
      const x = padding + i * step;
      const y = padding + innerH - ((v - minVal) / range) * innerH;
      return [x, y] as const;
    });
    const path = pts
      .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
      .join(" ");
    const area = `${path} L ${padding + innerW},${
      padding + innerH
    } L ${padding},${padding + innerH} Z`;
    return { pathD: path, areaD: area, points: pts, maxY: maxVal };
  }, [data, height]);

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
        {/* Area Fill */}
        <path d={areaD} fill={fill} />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill={stroke} />
        ))}
      </svg>
      {labels.length > 0 && (
        <div className="mt-2 grid grid-cols-12 text-[10px] text-gray-500">
          {labels.map((l, i) => (
            <div key={i} className="truncate text-center">
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type BarChartProps = {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
};

function BarChart({ data, height = 180, barColor = "#8e67b6" }: BarChartProps) {
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full h-[180px] flex items-end gap-2">
      {data.map((d, i) => {
        const h = (d.value / maxVal) * (height - 30);
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t-md"
              style={{ height: h, background: barColor }}
              title={`${d.label}: ${d.value}`}
            />
            <div className="mt-1 text-[10px] text-gray-500 truncate w-full text-center">
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type DonutProps = {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
};

function DonutChart({ data, size = 180, thickness = 20 }: DonutProps) {
  const total = Math.max(
    1,
    data.reduce((s, d) => s + d.value, 0)
  );
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {/* Track */}
          <circle
            r={radius}
            fill="none"
            stroke="#eee"
            strokeWidth={thickness}
          />
          {data.map((d, i) => {
            const frac = d.value / total;
            const len = circumference * frac;
            const dash = `${len} ${circumference - len}`;
            const circle = (
              <circle
                key={i}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return circle;
          })}
        </g>
      </svg>
      <div className="text-sm">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ background: d.color }}
            />
            <span className="text-gray-700">{d.label}</span>
            <span className="ml-auto font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function TeacherAnalyticsContent() {
  // Mock analytics (replace with real API when available)
  const monthlyRevenue = [
    1200, 1800, 1600, 2400, 2000, 3200, 4100, 3800, 4500, 5200, 4800, 5600,
  ];
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const weeklyRevenue = [620, 540, 880, 720, 960, 1020, 840, 910];
  const weekBars = weeklyRevenue.map((v, i) => ({
    label: `W${i + 1}`,
    value: v,
  }));

  const revenueByCourse = [
    { label: "React Masterclass", value: 5400, color: "#51356e" },
    { label: "JS Essentials", value: 3200, color: "#8e67b6" },
    { label: "Node.js Guide", value: 2100, color: "#a789c8" },
    { label: "Full Stack Bootcamp", value: 4600, color: "#c6b2de" },
  ];

  const topCourses = [
    { label: "React", value: 240 },
    { label: "JS", value: 180 },
    { label: "Node", value: 120 },
    { label: "Full Stack", value: 300 },
  ];

  // Added mock data for additional graphs
  const enrollmentsByCourse = [
    { label: "React Masterclass", value: 120 },
    { label: "JS Essentials", value: 90 },
    { label: "Node.js Guide", value: 60 },
    { label: "Full Stack Bootcamp", value: 150 },
  ];
  const completionRates = [80, 65, 70, 90];
  const completionLabels = ["React", "JS", "Node", "Full Stack"];
  const ratingsByCourse = [
    { label: "React Masterclass", value: 4.8, color: "#51356e" },
    { label: "JS Essentials", value: 4.5, color: "#8e67b6" },
    { label: "Node.js Guide", value: 4.2, color: "#a789c8" },
    { label: "Full Stack Bootcamp", value: 4.7, color: "#c6b2de" },
  ];
  const assignmentsSubmitted = [30, 25, 18, 40];
  const assignmentLabels = ["React", "JS", "Node", "Full Stack"];
  const quizScores = [85, 78, 92, 88];
  const quizLabels = ["React", "JS", "Node", "Full Stack"];

  const kpis = [
    {
      title: "Total Enrollments",
      value: enrollmentsByCourse.reduce((s, v) => s + v.value, 0),
    },
    {
      title: "Avg Completion Rate",
      value:
        Math.round(
          completionRates.reduce((s, v) => s + v, 0) / completionRates.length
        ) + "%",
    },
    {
      title: "Top Rated Course",
      value: ratingsByCourse.reduce(
        (top, curr) => (curr.value > top.value ? curr : top),
        ratingsByCourse[0]
      ).label,
    },
    {
      title: "Active Courses",
      value: revenueByCourse.length,
    },
    {
      title: "Total Assignments Submitted",
      value: assignmentsSubmitted.reduce((s, v) => s + v, 0),
    },
    {
      title: "Total Quiz Submitted",
      value: quizScores.length,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">
              Track your revenue and performance across time and courses.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((k, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-5"
            >
              <p className="text-sm text-gray-500 mb-1">{k.title}</p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {typeof k.value === "number" &&
                k.title.toLowerCase().includes("revenue")
                  ? formatCurrency(k.value as number)
                  : typeof k.value === "number" &&
                    k.title.toLowerCase().includes("monthly")
                  ? formatCurrency(k.value as number)
                  : k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* 1. Revenue by Course (Donut) */}

          {/* 2. Top Courses by Students (Bar) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Courses by Students
              </h2>
              <span className="text-sm text-gray-500">Current period</span>
            </div>
            <BarChart data={topCourses} barColor="#51356e" />
          </div>

          {/* 3. Enrollments by Course (Bar) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Enrollments by Course
              </h2>
              <span className="text-sm text-gray-500">Current period</span>
            </div>
            <BarChart data={enrollmentsByCourse} barColor="#8e67b6" />
          </div>

          {/* 4. Completion Rate by Course (Line) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Completion Rate (%)
              </h2>
              <span className="text-sm text-gray-500">Current period</span>
            </div>
            <LineChart
              data={completionRates}
              labels={completionLabels}
              height={140}
              stroke="#a789c8"
              fill="rgba(167,137,200,0.18)"
            />
          </div>

          {/* 5. Ratings by Course (Donut) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Course Ratings
              </h2>
              <span className="text-sm text-gray-500">Average rating</span>
            </div>
            <DonutChart data={ratingsByCourse} size={140} thickness={18} />
          </div>

          {/* 6. Assignments Submitted (Line) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Assignments Submitted
              </h2>
              <span className="text-sm text-gray-500">Current period</span>
            </div>
            <LineChart
              data={assignmentsSubmitted}
              labels={assignmentLabels}
              height={140}
              stroke="#c6b2de"
              fill="rgba(198,178,222,0.18)"
            />
          </div>

          {/* 7. Quiz Scores by Course (Bar) */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Quiz Scores by Course
              </h2>
              <span className="text-sm text-gray-500">Current period</span>
            </div>
            <BarChart
              data={quizLabels.map((l, i) => ({
                label: l,
                value: quizScores[i],
              }))}
              barColor="#51356e"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
        Connect your data source to power these graphs with real metrics:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Neon or Prisma Postgres for storing orders and payouts</li>
          <li>
            Supabase for authentication + row-level security and real-time
            metrics
          </li>
          <li>Zapier to automate reports or send weekly summaries</li>
          <li>Sentry to track frontend performance of analytics pages</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}

export default function TeacherAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherAnalyticsContent />
    </ProtectedRoute>
  );
}
