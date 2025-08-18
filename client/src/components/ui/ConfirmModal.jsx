
import React from "react";
import Button from "./Button";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
  cancelButtonClass = "bg-gray-500 hover:bg-gray-600 text-white",
  isLoading = false,
  icon = "fas fa-exclamation-triangle",
  iconClass = "text-red-500",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center`}>
              <i className={`${icon} ${iconClass} text-lg`}></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>

          {/* Message */}
          <div className="mb-6 text-gray-700">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={onClose}
              className={cancelButtonClass}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={confirmButtonClass}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
