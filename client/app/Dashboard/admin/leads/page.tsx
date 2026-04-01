"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load the Leads component
const Leads = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Leads"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    ),
    ssr: false,
  }
);

export default function LeadsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Leads & Admissions
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Track prospective student inquiries, schedule demos, and convert them to official enrollments.
        </p>
      </div>
      <Leads />
    </div>
  );
}
