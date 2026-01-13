"use client";
import React, { useState, useEffect } from "react";
import { Layers, Calendar, User } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { getBatchesByStudent } from "@/app/Services/Batch";
import moment from "moment";

interface StudentBatchesProps {
  studentId: string;
}

export default function StudentBatches({ studentId }: StudentBatchesProps) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) fetchBatches();
  }, [studentId]);

  const fetchBatches = async () => {
    try {
      const data = await getBatchesByStudent(studentId);
      setBatches(data);
    } catch (error) {
      console.error("Failed to fetch batches", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading batches...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" /> Enrolled Batches
        </h3>
      </div>

      <GlassCard className="p-6 min-h-[300px]">
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <Layers className="w-8 h-8 mb-2 opacity-50" />
            <p>No batches found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors space-y-3"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-neutral-900 dark:text-white line-clamp-1">
                    {batch.title}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      batch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span className="truncate">
                      {batch.trainer?.name || "No Trainer"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {moment(batch.startDate).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    <span>{batch.branch?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
