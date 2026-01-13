"use client";
import React, { useEffect, useState } from "react";
import { getAllCourses, deleteCourse } from "@/app/Services/CoursesAndTopics";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Loader2, Trash2, Plus, BookOpen, Clock, Layers } from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import AddCourseModal from "./AddCourseModal";
import ConfirmationModal from "./ConfirmationModal";

import { toast } from "sonner";

interface Course {
  _id: string;
  name: string;
  description: string;
  type: string;
  totalDuration?: number; // From aggregation
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    courseId: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getAllCourses();
      // data from backend is { data: [], total: number ... } based on controller
      if (data && data.data) {
        setCourses(data.data);
      } else {
        // Fallback if structure is different
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, courseId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCourse(deleteModal.courseId);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Course Management
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <GlassCard
              key={course._id}
              className="relative group overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 line-clamp-1">
                      {course.name}
                    </h3>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      {course.type}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(course._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1">
                <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3 mb-4">
                  {course.description || "No description provided."}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {course.totalDuration
                      ? `${course.totalDuration} hrs`
                      : "0 hrs"}
                  </span>
                </div>
                {/* Could add topic count if available from backend, currently not projected but easy to add if needed */}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchCourses}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        description="Are you sure you want to delete this course? All topic associations will be removed."
        confirmText="Delete"
      />
    </div>
  );
}
