"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { certificateService } from "@/services/certificateService";
import { useAuth } from "@/components/contexts/AuthContext";
import { Certificate, Course } from "@/types/api";

interface CertificateData extends Certificate {
  course?: Course;
}

function CertificateCard({
  certificate,
}: {
  certificate: CertificateData;
}): JSX.Element {
  const router = useRouter();
  const courseName = (certificate.course as any)?.title || "Course Certificate";
  const issueDate = new Date(certificate.issuedAt);
  const formattedDate = issueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certificateCode = certificate.certificateCode || certificate.certificateNumber || "N/A";

  const handleDownload = () => {
    if (certificate.certificateUrl) {
      window.open(certificate.certificateUrl, "_blank");
    }
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/student/certificates/${certificate.id}`);
  };

  const handleShare = async () => {
    const text = `I just completed "${courseName}" course and earned my certificate!`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "My Certificate",
        text: text,
        url: url,
      }).catch(err => console.log("Share failed:", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Certificate link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Certificate Preview */}
      <div className="relative w-full h-40 bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden flex items-center justify-center border-b border-gray-200">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-amber-600 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <p className="text-xs text-amber-700 font-semibold">Certificate of Completion</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
            {courseName}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Certificate ID:</span>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                {certificateCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-gray-600">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-green-700 font-medium">Verified</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 mt-auto">
          {certificate.certificateUrl && (
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleViewDetails}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
            >
              View
            </button>
            <button
              onClick={handleShare}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C9.839 15.859 11.564 17.811 13.891 19.81m-8.65-4.72a24.367 24.367 0 015.285-1.996m16.215-1.089a24.347 24.347 0 01-5.359 6.795M6.863 18.02m14.995-14.995L3.84 16.962m5.908-10.913a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}): JSX.Element {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${color}`}>{icon}</div>
        <div className="flex-1">
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage(): JSX.Element {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  useEffect(() => {
    if (authLoading || !userId) {
      return;
    }

    let isMounted = true;

    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await certificateService.list({
          userId,
          limit: 100,
        });

        if (isMounted) {
          const certList = response?.data || [];
          setCertificates(certList);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching certificates:", err);
          setError("Failed to load your certificates");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCertificates();

    return () => {
      isMounted = false;
    };
  }, [userId, authLoading]);

  // Filter and sort certificates
  useEffect(() => {
    let filtered = certificates;

    // Search by course name
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((c) =>
        String((c.course as any)?.title || "").toLowerCase().includes(search)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.issuedAt).getTime();
      const dateB = new Date(b.issuedAt).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, sortBy]);

  // Calculate statistics
  const stats = {
    totalCertificates: certificates.length,
    thisMonth: certificates.filter((c) => {
      const issueDate = new Date(c.issuedAt);
      const now = new Date();
      return (
        issueDate.getMonth() === now.getMonth() &&
        issueDate.getFullYear() === now.getFullYear()
      );
    }).length,
    thisYear: certificates.filter((c) => {
      const issueDate = new Date(c.issuedAt);
      return issueDate.getFullYear() === new Date().getFullYear();
    }).length,
  };

  if (authLoading || (loading && certificates.length === 0)) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your certificates...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">
            Showcase your achievements and accomplishments
          </p>
        </div>

        {/* Stats Section */}
        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatsCard
              icon="🏆"
              label="Total Certificates"
              value={stats.totalCertificates}
              color="text-amber-600"
            />
            <StatsCard
              icon="⭐"
              label="This Month"
              value={stats.thisMonth}
              color="text-blue-600"
            />
            <StatsCard
              icon="📅"
              label="This Year"
              value={stats.thisYear}
              color="text-green-600"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Certificates Section */}
        {certificates.length > 0 ? (
          <>
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search certificates by course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Sort */}
                <div className="flex gap-2">
                  {(["recent", "oldest"] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        sortBy === sort
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sort === "recent" ? "Most Recent" : "Oldest First"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Certificates Grid */}
            {filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">No certificates found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn your certificates and showcase your achievements!
            </p>
            <button
              onClick={() => router.push("/dashboard/student/courses")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 101-1v1a1 1 0 10-1 1h1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 111-1v1a1 1 0 11-1 1H2zM5.757 5.757a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
              </svg>
              View My Courses
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
