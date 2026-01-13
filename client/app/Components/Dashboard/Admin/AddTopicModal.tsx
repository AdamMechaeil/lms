"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/app/Components/ui/input";
import { Label } from "@/app/Components/ui/label";
import { Button } from "@/app/Components/ui/button";
import { createTopic } from "@/app/Services/CoursesAndTopics";

import { toast } from "sonner";

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTopicModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTopicModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    duration: "", // using string for input, convert to number on submit
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Topic Name is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0)
      newErrors.duration = "Duration must be valid hours";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    try {
      await createTopic({
        name: formData.name,
        duration: Number(formData.duration),
      });
      toast.success("Topic added successfully");
      onSuccess();
      onClose();
      setFormData({
        name: "",
        duration: "",
      });
    } catch (error: any) {
      console.error("Failed to create topic", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create topic";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" // z-60 to be above AddCourseModal if stacked, though usually side-by-side or handled carefully
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Add New Topic
                </h2>
                <div className="flex gap-2">
                  {apiError && (
                    <p className="text-sm text-red-500 font-medium self-center">
                      {apiError}
                    </p>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topicName">
                      Topic Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="topicName"
                      placeholder="e.g. Introduction to React"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      Duration (hours) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.5"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className={errors.duration ? "border-red-500" : ""}
                    />
                    {errors.duration && (
                      <p className="text-xs text-red-500">{errors.duration}</p>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-950/50">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Topic
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
