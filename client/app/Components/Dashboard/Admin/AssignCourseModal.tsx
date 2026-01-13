"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Loader2, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import {
  getAllCourses,
  assignCourseToStudent,
} from "@/app/Services/CoursesAndTopics";

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: string;
}

export default function AssignCourseModal({
  isOpen,
  onClose,
  onSuccess,
  studentId,
}: AssignCourseModalProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      setSearchTerm("");
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getAllCourses({ limit: 100 });
      setCourses(data.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (courseId: string) => {
    setAssigningId(courseId);
    try {
      await assignCourseToStudent({ studentId, courseId });
      toast.success("Course assigned successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to assign course", error);
      toast.error(error || "Failed to assign course");
    } finally {
      setAssigningId(null);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Assign Course
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-9 bg-white dark:bg-neutral-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">
                    No courses found.
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt={course.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-neutral-200">
                            {course.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {course.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssign(course._id)}
                        disabled={assigningId === course._id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {assigningId === course._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
