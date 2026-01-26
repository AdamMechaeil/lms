"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getBatchesByStudent } from "@/app/Services/Batch";
import { getStudentAttendance } from "@/app/Services/Attendance";
import { getCoursesByStudent } from "@/app/Services/CoursesAndTopics";
import { Loader2, Layers, BookOpen, Clock, CalendarDays } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";

export default function Main() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    todaysBatches: 0,
    attendance: 0, // Placeholder
  });
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // If auth is still loading, wait.
      if (authLoading) return;

      const studentId =
        (user as any)?._id || (user as any)?.id || (user as any)?.userId;

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const batchesData = await getBatchesByStudent(studentId);

        // Fetch Courses
        let coursesCount = 0;
        try {
          const coursesData = await getCoursesByStudent(studentId);
          if (Array.isArray(coursesData)) {
            coursesCount = coursesData.length;
          } else if (coursesData && Array.isArray(coursesData.data)) {
            coursesCount = coursesData.data.length;
          }
        } catch (err) {
          console.error("Failed to fetch courses:", err);
        }

        let batchList: any[] = [];
        if (Array.isArray(batchesData)) {
          batchList = batchesData;
        } else if (batchesData && Array.isArray(batchesData.data)) {
          batchList = batchesData.data;
        }

        // Fetch Attendance
        let attendancePercentage = 0;
        try {
          const attendanceData = await getStudentAttendance({ studentId });
          if (
            attendanceData &&
            attendanceData.data &&
            Array.isArray(attendanceData.data)
          ) {
            const history = attendanceData.data;
            const totalClasses = history.length;
            const presentClasses = history.filter(
              (r: any) => r.status === "Present",
            ).length;
            attendancePercentage =
              totalClasses > 0
                ? Math.round((presentClasses / totalClasses) * 100)
                : 0;
          }
        } catch (err) {
          console.error("Failed to fetch attendance:", err);
        }

        setBatches(batchList);

        // Calculate stats
        const activeBatches = batchList.filter((b) => b.status === "Running");

        // Today's Batches Logic
        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = day === 0 || day === 6;

        const todaysBatches = activeBatches.filter((b) => {
          if (isWeekend && b.type === "Weekends") return true;
          if (!isWeekend && b.type === "Weekdays") return true;
          return false;
        });

        setStats({
          coursesEnrolled: coursesCount,
          todaysBatches: todaysBatches.length,
          attendance: attendancePercentage,
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const studentId =
    (user as any)?._id || (user as any)?.id || (user as any)?.userId;
  if (!studentId) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Error: User ID not found. Please log in again.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {(user as any)?.name}. Track your learning progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers className="w-20 h-20 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Courses Enrolled
          </h3>
          <p className="text-4xl font-bold text-primary">
            {stats.coursesEnrolled}
          </p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-20 h-20 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Today's Batches
          </h3>
          <p className="text-4xl font-bold text-orange-500">
            {stats.todaysBatches}
          </p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-20 h-20 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Attendance
          </h3>
          <p className="text-4xl font-bold text-green-500">
            {stats.attendance}%
          </p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">My Batches</h3>
          {batches.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No batches found.
            </div>
          ) : (
            <div className="space-y-4">
              {batches.slice(0, 5).map((batch: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{batch.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {batch.trainer?.domain?.name || "No Domain"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        batch.status === "Running"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Upcoming Schedule */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Upcoming Schedule
          </h3>
          {batches.filter((b) => b.status === "Running").length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No active batches.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple logic: Show batches that are NOT today but are running */}
              {batches
                .filter((b) => b.status === "Running")
                .slice(0, 3)
                .map((batch: any, index: number) => {
                  // Determine next class day approx
                  const isWeekend = batch.type === "Weekends";
                  const todayDay = new Date().getDay();
                  const isToday =
                    (isWeekend && (todayDay === 0 || todayDay === 6)) ||
                    (!isWeekend && todayDay > 0 && todayDay < 6);

                  if (isToday) return null; // Skip today's classes as they are in "Today's Batches" potentially, or just list them all? User likely wants future.

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border-l-4 border-primary"
                    >
                      <div>
                        <p className="font-medium">{batch.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {batch.type} Batch
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {batch.startTime && batch.endTime
                          ? `${batch.startTime} - ${batch.endTime}`
                          : "Time N/A"}
                      </div>
                    </div>
                  );
                })}
              {/* Fallback if all classes are today or no future ones easy to determine */}
              {batches.filter((b) => b.status === "Running").length > 0 &&
                batches.filter((b) => {
                  const isWeekend = b.type === "Weekends";
                  const todayDay = new Date().getDay();
                  return (
                    (isWeekend && (todayDay === 0 || todayDay === 6)) ||
                    (!isWeekend && todayDay > 0 && todayDay < 6)
                  );
                }).length ===
                  batches.filter((b) => b.status === "Running").length && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    All your classes are scheduled for today! Check "Today's
                    Batches".
                  </div>
                )}

              {batches.filter((b) => b.status === "Running").length > 0 &&
                batches.filter((b) => {
                  const isWeekend = b.type === "Weekends";
                  const todayDay = new Date().getDay();
                  return !(
                    (isWeekend && (todayDay === 0 || todayDay === 6)) ||
                    (!isWeekend && todayDay > 0 && todayDay < 6)
                  );
                }).length === 0 &&
                null}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
