"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getBatchesByStudent } from "@/app/Services/Batch";
import { Loader2, Layers, Calendar, Clock, Video, User } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";

export default function Batches() {
  const { user, isLoading: authLoading } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      if (authLoading) return;

      const studentId =
        (user as any)?._id || (user as any)?.id || (user as any)?.userId;

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getBatchesByStudent(studentId);
        let batchList: any[] = [];
        if (Array.isArray(data)) {
          batchList = data;
        } else if (data && Array.isArray(data.data)) {
          batchList = data.data;
        }
        setBatches(batchList);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
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
          <h1 className="text-3xl font-bold">My Batches</h1>
          <p className="text-muted-foreground">
            Manage and view details of your assigned batches.
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-secondary/10 rounded-xl border border-dashed border-secondary">
          <Layers className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-muted-foreground">
            No batches found.
          </h3>
          <p className="text-sm text-center max-w-sm text-gray-500 mt-2">
            You currently are not assigned to any batches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {batches.map((batch: any, index: number) => (
            <GlassCard key={index} className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        batch.status === "Running"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {batch.status}
                    </span>
                    <span className="text-sm text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                      {batch.type}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {batch.name || batch.title}
                  </h3>

                  {/* Domain Info */}
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Domain:{" "}
                    <span className="font-medium text-foreground">
                      {batch.trainer?.domain?.name || "No Domain"}
                    </span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Trainer:</span>
                      <span className="font-medium">
                        {batch.trainer?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">
                        {batch.startDate
                          ? new Date(batch.startDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Timings:</span>
                      <span className="font-medium">
                        {batch.startTime && batch.endTime
                          ? `${batch.startTime} - ${batch.endTime}`
                          : "Time N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-start md:items-end gap-3 min-w-[200px]">
                  {batch.googleMeetLink ? (
                    <Button
                      className="w-full md:w-auto flex items-center gap-2"
                      onClick={() =>
                        window.open(batch.googleMeetLink, "_blank")
                      }
                    >
                      <Video className="w-4 h-4" />
                      Join Class
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      disabled
                      className="w-full md:w-auto"
                    >
                      No Meeting Link
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
