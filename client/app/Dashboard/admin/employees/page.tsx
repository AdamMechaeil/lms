"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load the Employees component
const Employees = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Employees"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    ),
    ssr: false,
  }
);

export default function EmployeesPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Staff & Employees
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Invite new staff members, assign custom roles, and manage internal access.
        </p>
      </div>
      <Employees />
    </div>
  );
}
