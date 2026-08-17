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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-800">
      {/* Per Page Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Posts per page:</span>
        <div className="flex gap-1">
          {PER_PAGE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => updateParams(1, option)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
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

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateParams(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 text-sm rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => updateParams(page)}
              className={`w-8 h-8 text-sm rounded-md transition-colors ${
                currentPage === page
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => updateParams(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-sm rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Post Count */}
      <span className="text-sm text-gray-500">
        {(currentPage - 1) * perPage + 1}–
        {Math.min(currentPage * perPage, totalPosts)} of {totalPosts}
      </span>
    </div>
  );
}
