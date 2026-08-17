"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPosts: number;
  currentPage: number;
  perPage: number;
}

const PER_PAGE_OPTIONS = [6, 9, 12, 15];

export default function Pagination({
  totalPosts,
  currentPage,
  perPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalPosts / perPage);

  const updateParams = (page: number, newPerPage?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("perPage", (newPerPage || perPage).toString());
    router.push(`/?${params.toString()}`);
  };

  // On mobile, show limited page numbers (current ± 1)
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push(-1); // ellipsis

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push(-2); // ellipsis
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800">
      {/* Page Navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => updateParams(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        <div className="flex gap-1">
          {getVisiblePages().map((page, idx) =>
            page < 0 ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center text-xs sm:text-sm text-gray-500"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => updateParams(page)}
                className={`w-7 sm:w-8 h-7 sm:h-8 text-xs sm:text-sm rounded-md transition-colors ${
                  currentPage === page
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => updateParams(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>

      {/* Per Page Selector + Count */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-400">Per page:</span>
          <div className="flex gap-1">
            {PER_PAGE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => updateParams(1, option)}
                className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                  perPage === option
                    ? "bg-orange-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs sm:text-sm text-gray-500">
          {(currentPage - 1) * perPage + 1}–
          {Math.min(currentPage * perPage, totalPosts)} of {totalPosts}
        </span>
      </div>
    </div>
  );
}
