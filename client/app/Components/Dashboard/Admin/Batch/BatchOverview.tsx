"use client";
import React from "react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Clock, Calendar, MapPin, User, Video, Loader2 } from "lucide-react";
import { createBatchMeetLink } from "@/app/Services/Batch";
import { toast } from "sonner";

interface BatchOverviewProps {
  batch: any;
  onRefresh: () => void;
}

export default function BatchOverview({
  batch,
  onRefresh,
}: BatchOverviewProps) {
  const [creatingLink, setCreatingLink] = React.useState(false);

  const handleCreateMeetLink = async () => {
    setCreatingLink(true);
    try {
      await createBatchMeetLink({
        batchId: batch._id,
        trainerId: batch.trainer._id,
      });
      toast.success("Google Meet link created successfully");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to create meet link:", error);
      toast.error(error || "Failed to create meet link");
    } finally {
      setCreatingLink(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          Batch Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Trainer
            </label>
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{batch.trainer?.name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Branch
            </label>
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{batch.branch?.name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Schedule
            </label>
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="font-medium">{batch.type}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Timing
            </label>
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-medium">
                {batch.startTime} - {batch.endTime}
              </span>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Status
            </label>
            <div className="mt-1">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  batch.status === "Running"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {batch.status}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          Google Meet
        </h2>

        {batch.googleMeetLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-blue-800 rounded-full shadow-sm">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-100" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Link Active
                </p>
                <a
                  href={batch.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-300 hover:underline break-all"
                >
                  {batch.googleMeetLink}
                </a>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(batch.googleMeetLink, "_blank")}
            >
              Join Meeting
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <Video className="w-8 h-8 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                No Meet Link Generated
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mt-1">
                Generate a recurring Google Meet link for this batch using the
                trainer's connected account.
              </p>
            </div>
            <Button
              onClick={handleCreateMeetLink}
              disabled={creatingLink}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {creatingLink && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Generate Meet Link
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
