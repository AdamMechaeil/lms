"use client";
import React from "react";
import { Mail, Phone, Layers, Calendar, User } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";

interface StudentOverviewProps {
  student: any;
}

export default function StudentOverview({ student }: StudentOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Branch</p>
            <p className="font-bold text-lg">{student.branch?.name || "N/A"}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Batch Type</p>
            <p className="font-bold text-lg">{student.type}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-neutral-100 dark:border-neutral-800 pb-2">
          Contact Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Mail className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Email</p>
              <p className="font-medium">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Phone className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Phone</p>
              <p className="font-medium">{student.mobileNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <User className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Gender</p>
              <p className="font-medium capitalize">
                {student.gender || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
