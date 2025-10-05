import React from "react";

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
  className?: string;
  showRange?: boolean;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  maxPagesToShow = 5,
  className = "",
  showRange = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = clamp(page, 1, totalPages);

  const getPageNumbers = () => {
    const max = Math.max(3, maxPagesToShow);
    const half = Math.floor(max / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, Math.min(start, end - max + 1));
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const goToPage = (p: number) => onPageChange(clamp(p, 1, totalPages));

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex =
    totalItems === 0 ? 0 : Math.min(startIndex + pageSize, totalItems);

  return (
    <div className={["w-full", className].join(" ").trim()}>
      <div className="flex flex-col items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 mt-3 px-3 sm:px-4 py-2.5 sm:py-3">
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={[
                "h-8 w-8 sm:h-9 sm:w-9 rounded-full text-sm font-medium",
                p === currentPage
                  ? "text-white"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")}
              style={
                p === currentPage ? { backgroundColor: "#51356e" } : undefined
              }
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>

        {showRange && (
          <div className="text-xs sm:text-sm text-gray-600">
            {totalItems === 0
              ? "0-0 of 0 items"
              : `${startIndex + 1}-${endIndex} of ${totalItems} items`}
          </div>
        )}
      </div>
    </div>
  );
}
