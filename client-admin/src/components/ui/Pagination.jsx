
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
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      {/* Mobile pagination */}
      <div className="flex items-center justify-between px-4 py-3 sm:hidden">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fas fa-chevron-left mr-1"></i>
            Prev
          </Button>
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Page</span>
            <span className="text-sm font-medium text-gray-900">{currentPage}</span>
            <span className="text-sm text-gray-500">of</span>
            <span className="text-sm font-medium text-gray-900">{totalPages}</span>
          </div>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <i className="fas fa-chevron-right ml-1"></i>
          </Button>
        </div>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center justify-center sm:justify-start">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700 font-medium">
                <span className="font-bold">{startIndex}</span> - <span className="font-bold">{endIndex}</span> of{" "}
                <span className="font-bold">{totalItems}</span> results
              </p>
            </div>
          </div>
          
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
                Show:
              </label>
              <select
                id="pageSize"
                value={itemsPerPage}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

        <div className="flex justify-center">
          <nav
            className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm"
            aria-label="Pagination"
          >
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-lg border-0 bg-transparent text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left text-xs mr-1" aria-hidden="true"></i>
              <span className="hidden sm:inline">Previous</span>
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
                    className={`relative inline-flex items-center px-3 py-2 border-0 text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-purple-100 text-purple-700 font-bold"
                        : "bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    1
                  </Button>
                );
                
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400">
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
                    className={`relative inline-flex items-center px-3 py-2 border-0 text-sm font-medium transition-colors ${
                      currentPage === i
                        ? "bg-purple-100 text-purple-700 font-bold"
                        : "bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
                    <span key="ellipsis2" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400">
                      ...
                    </span>
                  );
                }
                
                pages.push(
                  <Button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className={`relative inline-flex items-center px-3 py-2 border-0 text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "bg-purple-100 text-purple-700 font-bold"
                        : "bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
              className="relative inline-flex items-center px-3 py-2 rounded-r-lg border-0 bg-transparent text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <span className="hidden sm:inline">Next</span>
              <i className="fas fa-chevron-right text-xs ml-1" aria-hidden="true"></i>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
