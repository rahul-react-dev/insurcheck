import React, { useState } from "react";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";
import { TableSkeleton } from "../ui/SkeletonLoader";

export const DeletedDocumentsTable = ({
  documents,
  loading,
  pagination,
  totalCount,
  onSort,
  onPageChange,
  onPageSizeChange,
  onViewDocument,
  onDownloadDocument,
  onRecoverDocument,
  onDeleteDocument,
  actionLoading = {},
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return "fas fa-sort text-gray-400";
    }
    return sortConfig.direction === "asc"
      ? "fas fa-sort-up text-blue-500"
      : "fas fa-sort-down text-blue-500";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDocumentTypeIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const iconMap = {
      pdf: "fas fa-file-pdf text-red-500",
      docx: "fas fa-file-word text-blue-500",
      doc: "fas fa-file-word text-blue-500",
      xlsx: "fas fa-file-excel text-green-500",
      xls: "fas fa-file-excel text-green-500",
      pptx: "fas fa-file-powerpoint text-orange-500",
      ppt: "fas fa-file-powerpoint text-orange-500",
      txt: "fas fa-file-alt text-gray-500",
      jpg: "fas fa-file-image text-purple-500",
      jpeg: "fas fa-file-image text-purple-500",
      png: "fas fa-file-image text-purple-500",
      gif: "fas fa-file-image text-purple-500",
    };
    return iconMap[extension] || "fas fa-file text-gray-500";
  };

  const getVersionBadge = (version) => {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
        v{version}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="overflow-hidden">
        <TableSkeleton rows={5} columns={8} />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-trash-alt text-4xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Deleted Documents
        </h3>
        <p className="text-gray-500">
          No deleted documents found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center space-x-1">
                  <span>Document ID</span>
                  <i className={getSortIcon("id")}></i>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Document Name</span>
                  <i className={getSortIcon("name")}></i>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("tenantName")}
              >
                <div className="flex items-center space-x-1">
                  <span>Tenant Name</span>
                  <i className={getSortIcon("tenantName")}></i>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("userName")}
              >
                <div className="flex items-center space-x-1">
                  <span>User Name</span>
                  <i className={getSortIcon("userName")}></i>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("deletedBy")}
              >
                <div className="flex items-center space-x-1">
                  <span>Deleted By</span>
                  <i className={getSortIcon("deletedBy")}></i>
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("deletedAt")}
              >
                <div className="flex items-center space-x-1">
                  <span>Deletion Date</span>
                  <i className={getSortIcon("deletedAt")}></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  DOC-{document.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <i
                      className={`${getDocumentTypeIcon(document.name)} mr-3`}
                    ></i>
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {document.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(document.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-building text-blue-600 text-xs"></i>
                    </div>
                    <span>{document.tenantName || "Unknown Tenant"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-user text-green-600 text-xs"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{document.userName || "Unknown User"}</div>
                      <div className="text-xs text-gray-500">{document.userEmail || ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-user-shield text-red-600 text-xs"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{document.deletedByName || "System Admin"}</div>
                      <div className="text-xs text-gray-500">{document.deletedByEmail || ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(document.deletedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDocument(document)}
                      className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                      title="View Document"
                    >
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadDocument(document)}
                      className="text-green-600 hover:text-green-800 border-green-200 hover:border-green-300"
                    >
                      <i className="fas fa-download"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRecoverDocument(document)}
                      disabled={actionLoading[`recover_${document.id}`]}
                      className="text-yellow-600 hover:text-yellow-800 border-yellow-200 hover:border-yellow-300"
                    >
                      {actionLoading[`recover_${document.id}`] ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-undo"></i>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteDocument(document)}
                      disabled={actionLoading[`delete_${document.id}`]}
                      className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                    >
                      {actionLoading[`delete_${document.id}`] ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-trash"></i>
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <i
                  className={`${getDocumentTypeIcon(document.name)} mr-3 flex-shrink-0`}
                ></i>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {document.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    DOC-{document.id} • {getVersionBadge("1.0")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-gray-500">Deleted By:</span>
                <p className="text-gray-900 font-medium truncate">
                  {document.deletedByEmail || "System Admin"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Original Owner:</span>
                <p className="text-gray-900 font-medium truncate">
                  {document.userEmail || "Unknown User"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Deleted Date:</span>
                <p className="text-gray-900 font-medium">
                  {formatDate(document.deletedAt)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <p className="text-gray-900 font-medium">
                  {(document.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDocument(document)}
                className="text-blue-600 hover:text-blue-800 border-blue-200"
                title="View Document"
              >
                <i className="fas fa-eye mr-1"></i>
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadDocument(document)}
                className="text-green-600 hover:text-green-800 border-green-200"
              >
                <i className="fas fa-download mr-1"></i>
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRecoverDocument(document)}
                disabled={actionLoading[`recover_${document.id}`]}
                className="text-yellow-600 hover:text-yellow-800 border-yellow-200"
              >
                {actionLoading[`recover_${document.id}`] ? (
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                ) : (
                  <i className="fas fa-undo mr-1"></i>
                )}
                Recover
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeleteDocument(document)}
                disabled={actionLoading[`delete_${document.id}`]}
                className="text-red-600 hover:text-red-800 border-red-200"
              >
                {actionLoading[`delete_${document.id}`] ? (
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                ) : (
                  <i className="fas fa-trash mr-1"></i>
                )}
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 sm:px-6">
        <Pagination
          currentPage={pagination.page || 1}
          totalPages={pagination.totalPages || Math.ceil(totalCount / (pagination.pageSize || 10))}
          totalItems={totalCount}
          itemsPerPage={pagination.pageSize}
          onPageChange={onPageChange}
          onItemsPerPageChange={onPageSizeChange}
          showItemsPerPage={true}
          itemsPerPageOptions={[5, 10, 25, 50]}
        />
      </div>
    </div>
  );
};
