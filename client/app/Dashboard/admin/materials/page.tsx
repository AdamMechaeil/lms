"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Materials = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Materials"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
    ssr: false,
  }
);

export default function MaterialsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Materials />
    </div>
  );
}
