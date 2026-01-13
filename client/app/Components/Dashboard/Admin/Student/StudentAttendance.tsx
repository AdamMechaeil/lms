"use client";
import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { getStudentAttendance } from "@/app/Services/Attendance";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { getBatchesByStudent } from "@/app/Services/Batch";

interface StudentAttendanceProps {
  studentId: string;
}

export default function StudentAttendance({
  studentId,
}: StudentAttendanceProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchBatches();
      fetchAttendance();
    }
  }, [studentId]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedBatchId]);

  const fetchBatches = async () => {
    try {
      const data = await getBatchesByStudent(studentId);
      setBatches(data);
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params: any = { studentId };
      if (selectedBatchId && selectedBatchId !== "all") {
        params.batchId = selectedBatchId;
      }
      const data = await getStudentAttendance(params);
      setHistory(data.data || []);
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Late":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-200 rounded-full" />;
    }
  };

  if (loading) return <div>Loading attendance...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" /> Attendance History
        </h3>
        <div className="w-48">
          <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
            <SelectTrigger>
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch._id} value={batch._id}>
                  {batch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <GlassCard className="p-6 min-h-[300px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Trainer</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {moment(record.date).format("MMM DD, YYYY")}
                    </td>
                    <td className="px-4 py-3">
                      {record.batch?.title || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {record.trainer?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getStatusIcon(record.status)}
                        <span>{record.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
