"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getCoursesByStudent } from "@/app/Services/CoursesAndTopics";
import { Loader2, BookOpen } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";

export default function Courses() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (authLoading) return;

      const studentId =
        (user as any)?._id || (user as any)?.id || (user as any)?.userId;

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCoursesByStudent(studentId);
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && Array.isArray(data.data)) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            View all the courses you are enrolled in.
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-secondary/10 rounded-xl border border-dashed border-secondary">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-muted-foreground">
            No active courses found.
          </h3>
          <p className="text-sm text-center max-w-sm text-gray-500 mt-2">
            You currently don't have any active course enrollments. Contact your
            administrator if you believe this is a mistake.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any, index: number) => (
            <GlassCard
              key={index}
              className="p-0 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 relative">
                {course.image ? (
                  <img
                    src={`/assets/${course.image}`}
                    alt={course.name}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/600x400?text=Course+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                  {course.description || "No description available."}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
