"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getAllBatches } from "@/app/Services/Batch";
import { getAllStudents } from "@/app/Services/Student";
import {
  getBatchAttendance,
  markBatchAttendance,
} from "@/app/Services/Attendance";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { Input } from "@/app/Components/ui/input";
import {
  Loader2,
  Calendar as CalendarIcon,
  Save,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/app/Components/ui/label";

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

export default function Attendance() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Trainer's Batches
  useEffect(() => {
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      const fetchBatches = async () => {
        try {
          const trainerId =
            (user as any)._id || (user as any).id || (user as any).userId;
          const data = await getAllBatches({
            trainer: trainerId,
            limit: 100,
            status: "Running",
          });
          setBatches(data.data || []);
        } catch (error) {
          console.error("Failed to fetch batches", error);
        }
      };
      fetchBatches();
    }
  }, [user]);

  // Fetch Attendance or Students when Batch/Date changes
  useEffect(() => {
    if (selectedBatch && date) {
      fetchData();
    } else {
      setStudents([]);
      setAttendanceData({});
    }
  }, [selectedBatch, date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch existing attendance
      const existing = await getBatchAttendance({
        batchId: selectedBatch,
        date,
      });

      if (existing.data) {
        // Attendance exists, populate it
        const records: Record<string, AttendanceRecord> = {};
        // The API returns populated records.studentId, so we can extract students from there too
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
          batch: selectedBatch,
          limit: 100,
        });
        const studentList = studentData.data || [];
        setStudents(studentList);

        // Initialize default attendance (e.g., all Present or empty)
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
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    studentId: string,
    status: "Present" | "Absent" | "Late" | "Leave"
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
        batchId: selectedBatch,
        date,
        records,
        trainerId,
        trainerStatus: "Present", // Trainer marking it is assumed present
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
    <div className="space-y-6 h-full flex flex-col p-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">
          Mark attendance for your batches
        </p>
      </div>

      {/* Controls */}
      <GlassCard className="p-6 flex flex-col md:flex-row gap-6 items-end">
        <div className="space-y-2 w-full md:w-1/3">
          <Label>Select Batch</Label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="bg-white/50 dark:bg-black/20">
              <SelectValue placeholder="Select a batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch._id} value={batch._id}>
                  {batch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full md:w-1/3">
          <Label>Date</Label>
          <div className="relative">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/50 dark:bg-black/20 pl-10"
            />
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="w-full md:w-1/3 flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleMarkAll("Present")}
            disabled={!selectedBatch || loading}
            className="flex-1"
          >
            All Present
          </Button>
          <Button
            variant="outline"
            onClick={() => handleMarkAll("Absent")}
            disabled={!selectedBatch || loading}
            className="flex-1"
          >
            All Absent
          </Button>
        </div>
      </GlassCard>

      {/* Student List */}
      <div className="flex-1 min-h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !selectedBatch ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <CalendarIcon className="w-16 h-16 mb-4" />
            <p>Select a batch to view students</p>
          </div>
        ) : students.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <p>No students found in this batch</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => {
              const record = attendanceData[student._id];
              return (
                <GlassCard
                  key={student._id}
                  className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {student.studentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Present" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Present")}
                      className={
                        record?.status === "Present"
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:text-green-600 hover:border-green-600"
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Present
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Absent" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Absent")}
                      className={
                        record?.status === "Absent"
                          ? "bg-red-600 hover:bg-red-700"
                          : "hover:text-red-600 hover:border-red-600"
                      }
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Absent
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record?.status === "Late" ? "default" : "outline"
                      }
                      onClick={() => handleStatusChange(student._id, "Late")}
                      className={
                        record?.status === "Late"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "hover:text-yellow-600 hover:border-yellow-600"
                      }
                    >
                      <Clock className="w-4 h-4 mr-1" /> Late
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {selectedBatch && students.length > 0 && (
        <div className="sticky bottom-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="shadow-xl"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" /> Save Attendance
          </Button>
        </div>
      )}
    </div>
  );
}
