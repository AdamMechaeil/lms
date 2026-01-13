"use client";
import React, { useEffect, useState } from "react";
import { getMaterialsByBatch } from "@/app/Services/Materials";
import { GlassCard } from "@/app/Components/ui/glass-card";
import {
  Loader2,
  FileText,
  Video,
  Image as ImageIcon,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const AssignMaterialModal = dynamic(() => import("./AssignMaterialModal"), {
  ssr: false,
});

interface BatchMaterialsProps {
  batchId: string;
}

interface Material {
  _id: string;
  title: string;
  description: string;
  file: string;
  type: "Video" | "Document" | "Image";
}

export default function BatchMaterials({ batchId }: BatchMaterialsProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchBatchMaterials();
  }, [batchId]);

  const fetchBatchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getMaterialsByBatch(batchId);
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch batch materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="w-6 h-6 text-blue-500" />;
      case "Image":
        return <ImageIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <FileText className="w-6 h-6 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          Assigned Materials ({materials.length})
        </h2>
        <Button
          onClick={() => setIsAssignModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Assign Material
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/30 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No materials assigned to this batch yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materials.map((material) => (
            <GlassCard
              key={material._id}
              className="group relative overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Preview/Icon Area */}
              <div className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
                {material.type === "Image" ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/materials/${material.file}`}
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="scale-150 transform transition-transform group-hover:scale-125 duration-500">
                    {getIcon(material.type)}
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/materials/${material.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Download className="w-5 h-5" /> View
                  </a>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3
                    className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1"
                    title={material.title}
                  >
                    {material.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                    {material.type}
                  </span>
                </div>
                <p
                  className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2"
                  title={material.description}
                >
                  {material.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AssignMaterialModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={fetchBatchMaterials}
        batchId={batchId}
      />
    </div>
  );
}
