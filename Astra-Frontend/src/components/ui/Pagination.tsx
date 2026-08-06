import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const pageNumbers: (number | string)[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) pageNumbers.push('...');
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>

      <div className="flex gap-1">
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || currentPage === page || isLoading}
            className={`px-3 py-2 rounded text-sm transition-all ${
              currentPage === page
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-blue-500'
                : page === '...'
                  ? 'text-slate-500 cursor-default'
                  : 'bg-slate-800/50 border border-slate-600/50 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
