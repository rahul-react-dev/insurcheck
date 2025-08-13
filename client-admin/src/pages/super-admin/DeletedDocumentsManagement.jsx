import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { DeletedDocumentsTable } from "../../components/super-admin/DeletedDocumentsTable";
import { DeletedDocumentsFilters } from "../../components/super-admin/DeletedDocumentsFilters";
import { DeletedDocumentModal } from "../../components/super-admin/DeletedDocumentModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  fetchDeletedDocuments,
  exportDeletedDocuments,
  recoverDocument,
  permanentlyDeleteDocument,
  clearError,
  setFilters,
  setPagination,
  setDocumentViewError,
} from "../../store/super-admin/deletedDocumentsSlice";

const DeletedDocumentsManagement = () => {
  const dispatch = useDispatch();
  const {
    deletedDocuments,
    loading,
    error,
    filters,
    pagination,
    totalCount,
    exportLoading,
  } = useSelector((state) => state.deletedDocuments);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDeletedDocuments({ ...filters, ...pagination }));
  }, [dispatch, filters, pagination]);

  const handleSearch = (searchTerm) => {
    dispatch(setFilters({ searchTerm }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ page }));
  };

  const handlePageSizeChange = (pageSize) => {
    dispatch(setPagination({ pageSize, page: 1 }));
  };

  const handleSort = (sortBy, sortOrder) => {
    dispatch(setFilters({ sortBy, sortOrder }));
  };

  const handleExport = (format) => {
    dispatch(exportDeletedDocuments({ format, ...filters }));
    setExportDropdownOpen(false);
  };

  const handleViewDocument = (document) => {
    try {
      // Check if document has a valid view URL
      if (!document.viewUrl && !document.downloadUrl) {
        dispatch(setDocumentViewError("Document URL not available. File may be corrupted or inaccessible."));
        return;
      }

      const documentUrl = document.viewUrl || document.downloadUrl;
      const fileExtension = document.name.split('.').pop().toLowerCase();
      
      // Clear any previous errors
      dispatch(clearError());
      
      // For PDFs, use browser's built-in PDF viewer
      if (fileExtension === 'pdf') {
        const newWindow = window.open(documentUrl, '_blank');
        if (!newWindow) {
          dispatch(setDocumentViewError("Pop-up blocked. Please allow pop-ups for this site and try again."));
        }
      }
      // For supported document types that browsers can handle
      else if (['txt', 'jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
        const newWindow = window.open(documentUrl, '_blank');
        if (!newWindow) {
          dispatch(setDocumentViewError("Pop-up blocked. Please allow pop-ups for this site and try again."));
        }
      }
      // For Office documents, try to open with browser's capabilities
      else if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileExtension)) {
        // Try to open in new tab, fallback to download if browser can't handle
        const newWindow = window.open(documentUrl, '_blank');
        if (!newWindow) {
          dispatch(setDocumentViewError("Pop-up blocked. Please allow pop-ups for this site and try again."));
        }
      }
      // For other file types, show info modal instead
      else {
        setSelectedDocument(document);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error opening document:', error);
      dispatch(setDocumentViewError("Failed to open document. File may be corrupted or inaccessible."));
    }
  };

  const handleDownloadDocument = (document) => {
    try {
      // Check if download URL is available
      if (!document.downloadUrl) {
        dispatch(setDocumentViewError("Download URL not available. File may be corrupted or inaccessible."));
        return;
      }

      // Clear any previous errors
      dispatch(clearError());

      // Get file extension
      const fileExtension = document.name.split('.').pop().toLowerCase();
      
      // Create appropriate filename: {Document_Name}_{Document_ID}.extension
      const downloadFileName = `${document.name.split('.').slice(0, -1).join('.')}_${document.id}.${fileExtension}`;

      // Create download link
      const link = window.document.createElement("a");
      link.href = document.downloadUrl;
      link.download = downloadFileName;
      link.style.display = "none";
      
      // Add to DOM, click, and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Show success message (optional - could be a toast notification)
      console.log(`Download initiated: ${downloadFileName}`);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      dispatch(setDocumentViewError("Failed to download document. Please try again."));
    }
  };

  const handleRecoverDocument = (document) => {
    setSelectedDocument(document);
    setConfirmAction({
      type: "recover",
      title: "Recover Document",
      message: `Are you sure you want to recover "${document.name}"? This will restore it to the original owner's admin panel.`,
      confirmText: "Recover",
      onConfirm: () => {
        dispatch(recoverDocument(document.id));
        setIsConfirmModalOpen(false);
        setSelectedDocument(null);
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handlePermanentDelete = (document) => {
    setSelectedDocument(document);
    setConfirmAction({
      type: "delete",
      title: "Permanently Delete Document",
      message: `Are you sure you want to permanently delete "${document.name}"? This action cannot be undone.`,
      confirmText: "Delete Permanently",
      onConfirm: () => {
        dispatch(permanentlyDeleteDocument(document.id));
        setIsConfirmModalOpen(false);
        setSelectedDocument(null);
      },
      danger: true,
    });
    setIsConfirmModalOpen(true);
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-trash-restore text-red-500 mr-3 flex-shrink-0"></i>
              <span className="truncate">Deleted Documents Management</span>
            </h1>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              View, manage, and recover deleted documents from all tenant admins
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>Document Recovery System Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-database"></i>
                <span>Total Deleted: {totalCount}</span>
              </div>
            </div>
          </div>

          {/* Export Dropdown */}
          <div className="flex-shrink-0 relative">
            <Button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={exportLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {exportLoading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-download mr-2"></i>
              )}
              Export
              <i className="fas fa-chevron-down ml-2"></i>
            </Button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="fas fa-file-pdf text-red-500 mr-3"></i>
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="fas fa-file-csv text-green-500 mr-3"></i>
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport("excel")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="fas fa-file-excel text-emerald-500 mr-3"></i>
                    Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
              <span className="text-red-700">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseError}
              className="text-red-500 hover:text-red-700"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <DeletedDocumentsFilters
          filters={filters}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </Card>

      {/* Documents Table */}
      <Card>
        <DeletedDocumentsTable
          documents={deletedDocuments}
          loading={loading}
          pagination={pagination}
          totalCount={totalCount}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onViewDocument={handleViewDocument}
          onDownloadDocument={handleDownloadDocument}
          onRecoverDocument={handleRecoverDocument}
          onDeleteDocument={handlePermanentDelete}
        />
      </Card>

      {/* Document View Modal */}
      {isViewModalOpen && selectedDocument && (
        <DeletedDocumentModal
          document={selectedDocument}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && confirmAction && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setConfirmAction(null);
            setSelectedDocument(null);
          }}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          danger={confirmAction.danger}
        />
      )}

      {/* Click outside to close export dropdown */}
      {exportDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExportDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default DeletedDocumentsManagement;
