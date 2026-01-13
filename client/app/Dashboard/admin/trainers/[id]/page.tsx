"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const TrainerDetail = dynamic(
  () => import("@/app/Components/Dashboard/Admin/TrainerDetail"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    ),
    ssr: false,
  }
);

export default function TrainerDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Correct parameter extraction

  if (!id) return <div>Invalid Trainer ID</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <TrainerDetail trainerId={id} />
    </div>
  );
}
