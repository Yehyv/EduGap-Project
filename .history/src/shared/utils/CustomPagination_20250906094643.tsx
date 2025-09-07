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
          className={`tw-mx-1 tw-rounded-md tw-px-3 tw-py-1 tw-text-sm tw-font-medium tw-transition-colors ${
            currentPage === i
              ? "tw-bg-blue-600 tw-text-white"
              : "tw-bg-gray-100 tw-text-gray-700 hover:tw-bg-blue-100"
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
    <div className="tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-overflow-auto tw-py-4">
      {/* First */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-sm tw-text-gray-600 hover:tw-bg-gray-200 disabled:tw-cursor-not-allowed disabled:tw-opacity-50 max-sm:hidden"
        aria-label="First Page"
      >
        ⏮
      </button>

      {/* Prev */}
      <button
        onClick={handlePreviousClick}
        disabled={currentPage === 1}
        className="tw-flex tw-items-center tw-rounded-md tw-border tw-px-3 tw-py-1 tw-text-sm tw-text-gray-600 hover:tw-bg-gray-200 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
        aria-label="Previous Page"
      >
        ◀ <span className="max-sm:hidden tw-ml-1">Prev</span>
      </button>

      {/* Page Numbers */}
      {renderPageNumbers()}

      {/* Next */}
      <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className="tw-flex tw-items-center tw-rounded-md tw-border tw-px-3 tw-py-1 tw-text-sm tw-text-gray-600 hover:tw-bg-gray-200 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
        aria-label="Next Page"
      >
        <span className="max-sm:hidden tw-mr-1">Next</span> ▶
      </button>

      {/* Last */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-sm tw-text-gray-600 hover:tw-bg-gray-200 disabled:tw-cursor-not-allowed disabled:tw-opacity-50 max-sm:hidden"
        aria-label="Last Page"
      >
        ⏭
      </button>
    </div>
  );
};

export default CustomPagination;
