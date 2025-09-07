import Arrow from "@/assets/svgs/ArrowPagination.svg?react";
import DoubleArrow from "@/assets/svgs/DoubleArrowPagination.svg?react";
type CustomPaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const CustomPagination = ({
  totalPages,
  currentPage,
  onPageChange,
}: CustomPaginationProps) => {
  const handlePreviousClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(currentPage + 2, totalPages);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`mx-1 rounded-full w-7 h-7 text-center text-sm font-bold transition-colors ${
            currentPage === i
              ? "bg-secondary text-white"
              : "text-gray-400 hover:bg-blue-100"
          }`}
          aria-label={`Go to page ${i}`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2 overflow-auto py-4">
      {/* First */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="rounded-md border px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 max-sm:hidden"
        aria-label="First Page"
      >
        ⏭
      </button>

      {/* Prev */}
      <button
        onClick={handlePreviousClick}
        disabled={currentPage === 1}
        className="flex items-center rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous Page"
      >
        <Arrow />
      </button>

      {/* Page Numbers */}
      {renderPageNumbers()}

      {/* Next */}
      <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className="flex items-center rounded-md border px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next Page"
      >
        <span className="max-sm:hidden mr-1">Next</span> ◀
      </button>

      {/* Last */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="rounded-md border px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 max-sm:hidden"
        aria-label="Last Page"
      >
        ⏮
      </button>
    </div>
  );
};

export default CustomPagination;
