
import React from "react";
import Button from "./Button";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 25, 50],
  className = "",
}) => {
  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (event) => {
    const newLimit = parseInt(event.target.value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newLimit);
    }
  };

  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null;
  }

  return (
    <div className={`bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 ${className}`}>
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
          
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">
                Show:
              </label>
              <select
                id="pageSize"
                value={itemsPerPage}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>
          )}
        </div>

        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left h-4 w-4 text-gray-700" aria-hidden="true"></i>
              <span className="ml-1 hidden sm:inline">Previous</span>
            </Button>

            {/* Page numbers */}
            {(() => {
              const pages = [];
              const showPages = 5; // Number of page buttons to show
              let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
              let endPage = Math.min(totalPages, startPage + showPages - 1);

              // Adjust start page if we're near the end
              if (endPage - startPage < showPages - 1) {
                startPage = Math.max(1, endPage - showPages + 1);
              }

              // Show first page and ellipsis if needed
              if (startPage > 1) {
                pages.push(
                  <Button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    1
                  </Button>
                );
                
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-800">
                      ...
                    </span>
                  );
                }
              }

              // Show page numbers
              for (let i = startPage; i <= endPage; i++) {
                if (i === 1 && startPage === 1) continue; // Skip if already added
                
                pages.push(
                  <Button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {i}
                  </Button>
                );
              }

              // Show ellipsis and last page if needed
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-800">
                      ...
                    </span>
                  );
                }
                
                pages.push(
                  <Button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === totalPages
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {totalPages}
                  </Button>
                );
              }

              return pages;
            })()}

            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <span className="sr-only">Next</span>
              <span className="mr-1 hidden sm:inline">Next</span>
              <i className="fas fa-chevron-right h-4 w-4 text-gray-700" aria-hidden="true"></i>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
