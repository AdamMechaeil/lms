"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load the Students component
const Students = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Students"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
    ssr: false,
  }
);

export default function StudentsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Students
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage all students, enrollments, and profiles.
        </p>
      </div>
      <Students />
    </div>
  );
}
