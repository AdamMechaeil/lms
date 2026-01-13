"use client";
import React, { useEffect, useState } from "react";
import {
  getBatchAttendance,
  markBatchAttendance,
} from "@/app/Services/Attendance";
import { getAllStudents } from "@/app/Services/Student"; // Need students to list them even if no attendance record
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import {
  Loader2,
  CalendarCheck,
  User,
  Check,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface BatchAttendanceProps {
  batchId: string;
  trainerId: string; // Needed for marking
}

interface AttendanceRecord {
  studentId:
    | {
        _id: string;
        name: string;
        profilePicture?: string;
      }
    | string;
  status: "Present" | "Absent" | "Late" | "Excused";
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  profilePicture?: string;
}

export default function BatchAttendance({
  batchId,
  trainerId,
}: BatchAttendanceProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchedAttendance, setFetchedAttendance] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, [batchId]);

  useEffect(() => {
    if (selectedDate) fetchAttendanceForDate();
  }, [selectedDate, batchId]);

  const fetchInitialData = async () => {
    try {
      // Fetch all students in this batch to build the master list
      const studentData = await getAllStudents({ batch: batchId, limit: 100 });
      setStudents(studentData.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const fetchAttendanceForDate = async () => {
    setLoading(true);
    try {
      const response = await getBatchAttendance({
        batchId,
        date: selectedDate,
      });

      const newRecords: Record<string, string> = {};

      if (response.data) {
        setFetchedAttendance(response.data);
        response.data.records.forEach((rec: any) => {
          // Handle populated vs unpopulated
          const sId =
            typeof rec.studentId === "string"
              ? rec.studentId
              : rec.studentId._id;
          newRecords[sId] = rec.status;
        });
      } else {
        setFetchedAttendance(null);
        // If no record, default to empty or maybe auto-mark all present? Let's leave empty.
      }
      setAttendanceRecords(newRecords);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceRecords).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      // Validate if all students marked? Maybe not strictly required but good UX.
      // Let's allow partial marking for now.

      await markBatchAttendance({
        batchId,
        date: selectedDate,
        records,
        trainerId: trainerId, // Use the batch's trainer ID
        trainerStatus: "Present", // Assumed present if admin marks? Or we could add a checkbox.
      });

      toast.success("Attendance saved successfully");
      fetchAttendanceForDate(); // Refresh
    } catch (error: any) {
      console.error("Failed to save attendance", error);
      toast.error(error || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Absent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "Excused":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              DataWise Attendance
            </h2>
            <p className="text-xs text-neutral-500">
              Manage daily attendance records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto bg-white/50 dark:bg-neutral-900/50"
          />
          <Button
            onClick={handleSaveAttendance}
            disabled={saving || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/30 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No students found in this batch to mark attendance.
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <GlassCard
              key={student._id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                  {student.profilePicture ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/profilePicture/${student.profilePicture}`}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {student.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {student.studentId}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {["Present", "Absent", "Late", "Excused"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(student._id, status)}
                    className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all border
                            ${
                              attendanceRecords[student._id] === status
                                ? getStatusColor(status) +
                                  " ring-2 ring-offset-2 dark:ring-offset-neutral-900 ring-blue-500/20"
                                : "bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            }
                        `}
                  >
                    <div className="flex items-center gap-1.5">
                      {status === "Present" && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      {status === "Absent" && <X className="w-3.5 h-3.5" />}
                      {status === "Late" && <Clock className="w-3.5 h-3.5" />}
                      {status === "Excused" && (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {status}
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
