"use client";
import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/app/Components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      variant === "danger"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500"
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    {title}
                  </h2>
                </div>

                <p className="text-neutral-600 dark:text-neutral-300 mb-8">
                  {description}
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>
                    {cancelText}
                  </Button>
                  <Button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={
                      variant === "danger"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : ""
                    }
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
