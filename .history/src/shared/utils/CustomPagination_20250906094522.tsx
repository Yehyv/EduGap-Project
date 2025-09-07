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
    let endPage = Math.min(currentPage + 3, totalPages);

    // Adjust start and end pages if currentPage is near the beginning or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(i)}
            aria-label={i.toString()}
          >
            {i}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };

  return (
    <ul className="pagination justify-content-center pagination-sm overflow-auto">
      <li
        className={`page-item ${
          currentPage === 1 ? "disabled" : ""
        } max-sm:hidden`}
      >
        <button
          className="page-link"
          onClick={() => onPageChange(1)}
          aria-label="First"
        >
          <span aria-hidden="true" className="material-icons">
            first_page
          </span>
        </button>
      </li>
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""} `}>
        <button
          className="page-link"
          onClick={handlePreviousClick}
          aria-label="Previous"
        >
          <span aria-hidden="true" className="material-icons">
            chevron_left
          </span>
          <span className="max-sm:hidden">Prev</span>
        </button>
      </li>

      {renderPageNumbers()}
      <li
        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={handleNextClick}
          aria-label="Next"
        >
          <span className="max-sm:hidden">Next</span>
          <span aria-hidden="true" className="material-icons">
            chevron_right
          </span>
        </button>
      </li>
      <li
        className={`page-item ${
          currentPage === totalPages ? "disabled" : ""
        } max-sm:hidden`}
      >
        <button
          className="page-link"
          onClick={() => onPageChange(totalPages)}
          aria-label="Last"
        >
          <span aria-hidden="true" className="material-icons">
            last_page
          </span>
        </button>
      </li>
    </ul>
  );
};

export default CustomPagination;
