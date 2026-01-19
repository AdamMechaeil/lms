"use client";
import React from "react";
import SharedDashboardLayout from "@/app/Components/Shared/Layout/SharedDashboardLayout";
import {
  LayoutDashboard,
  Layers,
  ClipboardCheck,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    {
      label: "Dashboard",
      href: "/Dashboard/trainer",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Batches",
      href: "/Dashboard/trainer/batches",
      icon: (
        <Layers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Attendance",
      href: "/Dashboard/trainer/attendance",
      icon: (
        <ClipboardCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My Students",
      href: "/Dashboard/trainer/students",
      icon: (
        <GraduationCap className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Materials",
      href: "/Dashboard/trainer/materials",
      icon: (
        <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <SharedDashboardLayout links={links} userType="trainer">
      {children}
    </SharedDashboardLayout>
  );
}
