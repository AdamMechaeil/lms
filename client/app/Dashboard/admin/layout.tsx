import React from "react";
import SharedDashboardLayout from "@/app/Components/Shared/Layout/SharedDashboardLayout";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Layers,
  Globe,
  BookOpen,
  FileText,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    {
      label: "Dashboard",
      href: "/Dashboard/admin",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Trainers",
      href: "/Dashboard/admin/trainers",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Students",
      href: "/Dashboard/admin/students",
      icon: (
        <GraduationCap className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Branches",
      href: "/Dashboard/admin/branches",
      icon: (
        <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Batches",
      href: "/Dashboard/admin/batches",
      icon: (
        <Layers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Courses",
      href: "/Dashboard/admin/courses",
      icon: (
        <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Materials",
      href: "/Dashboard/admin/materials",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Domains",
      href: "/Dashboard/admin/domains",
      icon: (
        <Globe className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <SharedDashboardLayout links={links} userType="admin">
      {children}
    </SharedDashboardLayout>
  );
}
