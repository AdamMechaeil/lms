"use client";
import React from "react";
import SharedDashboardLayout from "@/app/Components/Shared/Layout/SharedDashboardLayout";
import {
  LayoutDashboard,
  Layers,
  User,
  CalendarCheck,
  BookOpen,
} from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    {
      label: "Dashboard",
      href: "/Dashboard/student",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My Batches",
      href: "/Dashboard/student/batches",
      icon: (
        <Layers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My Courses",
      href: "/Dashboard/student/courses",
      icon: (
        <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Attendance",
      href: "/Dashboard/student/attendance",
      icon: (
        <CalendarCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/Dashboard/student/profile",
      icon: (
        <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <SharedDashboardLayout links={links} userType="student">
      {children}
    </SharedDashboardLayout>
  );
}
