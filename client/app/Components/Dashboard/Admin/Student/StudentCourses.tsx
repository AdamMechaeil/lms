"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { getCoursesByStudent } from "@/app/Services/CoursesAndTopics";
import dynamic from "next/dynamic";

const AssignCourseModal = dynamic(
  () => import("@/app/Components/Dashboard/Admin/AssignCourseModal"),
  { ssr: false }
);

interface StudentCoursesProps {
  studentId: string;
}

export default function StudentCourses({ studentId }: StudentCoursesProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    if (studentId) fetchCourses();
  }, [studentId]);

  const fetchCourses = async () => {
    try {
      const data = await getCoursesByStudent(studentId);
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" /> Enrolled Courses
        </h3>
        <Button
          size="sm"
          onClick={() => setIsAssignModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Assign Course
        </Button>
      </div>

      <GlassCard className="p-6 min-h-[300px]">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
            <p>No courses assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {course.name}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">{course.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <AssignCourseModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          fetchCourses();
          setIsAssignModalOpen(false);
        }}
        studentId={studentId}
      />
    </div>
  );
}
