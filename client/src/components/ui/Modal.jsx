/**
 * Modal Component
 * Accessible modal dialog with backdrop
 */

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

/**
 * Modal component for dialogs and confirmations
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size (sm, md, lg, xl)
 * @param {boolean} props.showClose - Show close button
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Modal component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  className = "",
}) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} ${className} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          {showClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/**
 * ModalFooter component for modal actions
 */
export function ModalFooter({ children, className = "" }) {
  return (
    <div
      className={`flex items-center justify-end gap-3 p-6 border-t border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * ConfirmationModal component for confirmations
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-700">{message}</p>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={isLoading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
