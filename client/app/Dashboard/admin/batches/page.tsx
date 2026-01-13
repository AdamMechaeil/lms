"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Batches = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Batches"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
    ssr: false,
  }
);

export default function BatchesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Batches />
    </div>
  );
}
