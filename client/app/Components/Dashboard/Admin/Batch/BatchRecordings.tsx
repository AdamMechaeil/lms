"use client";
import React, { useEffect, useState } from "react";
import { getBatchRecordings } from "@/app/Services/Batch";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Loader2, Video, ExternalLink, Calendar } from "lucide-react";

interface BatchRecordingsProps {
  batchId: string;
}

interface Recording {
  webViewLink: string;
  name: string;
  createdTime: string;
  thumbnailLink: string;
  hasThumbnail: boolean;
}

export default function BatchRecordings({ batchId }: BatchRecordingsProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecordings();
  }, [batchId]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await getBatchRecordings(batchId);
      setRecordings(data);
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          Class Recordings ({recordings.length})
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/30 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <Video className="w-8 h-8 text-neutral-400" />
            </div>
          </div>
          <p>No recordings found for this batch.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Recordings from the attached Google Drive will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording, index) => (
            <GlassCard
              key={index}
              className="group overflow-hidden p-0 hover:ring-2 hover:ring-blue-500/20 transition-all duration-300"
            >
              <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800">
                {/* Thumbnail or Placeholder */}
                {recording.hasThumbnail ? (
                  <img
                    src={recording.thumbnailLink}
                    alt={recording.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-10 h-10 text-neutral-400" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={recording.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                  >
                    Watch Recording <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3
                  className="font-medium text-neutral-800 dark:text-neutral-100 line-clamp-2"
                  title={recording.name}
                >
                  {recording.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(recording.createdTime).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
