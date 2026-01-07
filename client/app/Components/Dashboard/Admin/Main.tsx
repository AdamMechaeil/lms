"use client";

import { Sidebar } from "../../Shared/Sidebar";
import { Building2, GraduationCap, Users } from "lucide-react";
import { HoverEffect } from "../../ui/card-hover-effect";

export function Main() {
  // Mock data for now, replace with API calls later
  const stats = [
    {
      title: "Total Branches",
      description: "12",
      icon: <Building2 className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Total Students",
      description: "1,234",
      icon: <GraduationCap className="w-8 h-8 text-emerald-500" />,
    },
    {
      title: "Total Trainers",
      description: "56",
      icon: <Users className="w-8 h-8 text-violet-500" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden w-full font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
              Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Overview of your learning management system.
            </p>
          </div>

          {/* Stats Grid using Aceternity HoverEffect */}
          <HoverEffect items={stats} />
        </div>
      </main>
    </div>
  );
}
