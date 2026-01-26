"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getStudentAttendance } from "@/app/Services/Attendance";
import { Loader2, CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";

export default function Attendance() {
  const { user, isLoading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0, percentage: 0 });

  useEffect(() => {
    const fetchAttendance = async () => {
      if (authLoading) return;

      const studentId =
        (user as any)?._id || (user as any)?.id || (user as any)?.userId;

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getStudentAttendance({ studentId });
        let history: any[] = [];

        if (response && response.data && Array.isArray(response.data)) {
          history = response.data;
        } else if (Array.isArray(response)) {
          history = response;
        }

        // Sort by date descending
        history.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setAttendance(history);

        const total = history.length;
        const present = history.filter((r) => r.status === "Present").length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        setStats({ total, present, percentage });
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
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
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            View your class attendance history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">
            Total Classes
          </h3>
          <span className="text-4xl font-bold">{stats.total}</span>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">
            Classes Attended
          </h3>
          <span className="text-4xl font-bold text-green-500">
            {stats.present}
          </span>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">
            Attendance Rate
          </h3>
          <span
            className={`text-4xl font-bold ${stats.percentage >= 75 ? "text-green-500" : "text-orange-500"}`}
          >
            {stats.percentage}%
          </span>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4">Attendance History</h3>
        {attendance.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No attendance records found.
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.map((record: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${record.status === "Present" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {record.status === "Present" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.batchId?.name || "Batch Name Unavailable"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    record.status === "Present"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
