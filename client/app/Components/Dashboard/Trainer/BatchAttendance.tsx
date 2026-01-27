"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getAllStudents } from "@/app/Services/Student";
import {
  getBatchAttendance,
  markBatchAttendance,
} from "@/app/Services/Attendance";
import { GlassCard } from "../../ui/glass-card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Loader2,
  Calendar as CalendarIcon,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "../../ui/label";

interface Student {
  _id: string;
  name: string;
  studentId: string;
  profilePicture?: string;
}

interface AttendanceRecord {
  studentId: string;
  status: "Present" | "Absent" | "Late" | "Leave";
  remarks?: string;
}

interface BatchAttendanceProps {
  batchId: string;
}

export default function BatchAttendance({ batchId }: BatchAttendanceProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Attendance or Students when Batch/Date changes
  useEffect(() => {
    if (batchId && date) {
      fetchData();
    }
  }, [batchId, date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch existing attendance
      const existing = await getBatchAttendance({
        batchId: batchId,
        date,
      });

      if (existing.data) {
        // Attendance exists, populate it
        const records: Record<string, AttendanceRecord> = {};

        // Map records to student list (handling potential missing students if they were removed?)
        // For now, trust the attendance record's studentId population
        const studentList: Student[] = existing.data.records.map((r: any) => ({
          _id: r.studentId._id,
          name: r.studentId.name,
          studentId: r.studentId.studentId,
          profilePicture: r.studentId.profilePicture,
        }));

        setStudents(studentList);

        existing.data.records.forEach((r: any) => {
          records[r.studentId._id] = {
            studentId: r.studentId._id,
            status: r.status,
            remarks: r.remarks,
          };
        });
        setAttendanceData(records);
      } else {
        // 2. No attendance, fetch all students in batch
        const studentData = await getAllStudents({
          batch: batchId,
          limit: 100,
        });
        const studentList = studentData.data || [];
        setStudents(studentList);

        // Initialize default attendance (e.g., all Present)
        const initialRecords: Record<string, AttendanceRecord> = {};
        studentList.forEach((s: Student) => {
          initialRecords[s._id] = {
            studentId: s._id,
            status: "Present", // Default to Present
            remarks: "",
          };
        });
        setAttendanceData(initialRecords);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    studentId: string,
    status: "Present" | "Absent" | "Late" | "Leave",
  ) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleMarkAll = (status: "Present" | "Absent") => {
    setAttendanceData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key].status = status;
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const records = Object.values(attendanceData);
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;

      await markBatchAttendance({
        batchId: batchId,
        date,
        records,
        trainerId,
        trainerStatus: "Present",
      });
      toast.success("Attendance marked successfully");
    } catch (error: any) {
      console.error("Submit error", error);
      toast.error(error.toString() || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-neutral-50 dark:bg-white/5 p-4 rounded-xl border border-neutral-100 dark:border-white/5">
        <div className="space-y-2 w-full md:w-auto">
          <Label>Date</Label>
          <div className="relative">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/50 dark:bg-black/20 pl-10 w-full md:w-[200px]"
            />
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll("Present")}
            disabled={loading || students.length === 0}
            className="flex-1 md:flex-none"
          >
            All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll("Absent")}
            disabled={loading || students.length === 0}
            className="flex-1 md:flex-none"
          >
            All Absent
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
            <p>No students found in this batch</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {students.map((student) => {
              const record = attendanceData[student._id];
              return (
                <div
                  key={student._id}
                  className="p-3 rounded-lg bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:bg-neutral-100 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {student.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Present" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Present")}
                      className={`h-8 text-xs ${
                        record?.status === "Present"
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:text-green-600 hover:border-green-600"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> P
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Absent" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Absent")}
                      className={`h-8 text-xs ${
                        record?.status === "Absent"
                          ? "bg-red-600 hover:bg-red-700"
                          : "hover:text-red-600 hover:border-red-600"
                      }`}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> A
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Late" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Late")}
                      className={`h-8 text-xs ${
                        record?.status === "Late"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "hover:text-yellow-600 hover:border-yellow-600"
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" /> L
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Leave" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Leave")}
                      className={`h-8 text-xs ${
                        record?.status === "Leave"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:text-blue-600 hover:border-blue-600"
                      }`}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" /> Lv
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {students.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="w-full sm:w-auto shadow-lg"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Attendance for {new Date(date).toLocaleDateString()}
          </Button>
        </div>
      )}
    </div>
  );
}
